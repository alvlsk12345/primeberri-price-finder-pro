import { toast } from "sonner";
import { getApiKey } from "./config";
import { processApiResponse } from "./responseUtils";
import { isUsingSupabaseBackend } from "../supabase/config";
import { isSupabaseConnected } from "../supabase/client";
import { searchViaOpenAI } from "../supabase/aiService";
import { MAX_RETRY_ATTEMPTS, createNetworkErrorHandler, OpenAIRequestOptions } from "./proxyUtils";

// Базовая функция для использования OpenAI API без CORS прокси
export const callOpenAI = async (prompt: string, options: OpenAIRequestOptions = {}): Promise<any> => {
  // Инициализируем обработчик ошибок
  const handleNetworkError = createNetworkErrorHandler(callOpenAI);

  // Проверяем, используем ли мы Supabase бэкенд и подключен ли он
  const isSupabaseEnabled = await isUsingSupabaseBackend();
  const isSupabaseReady = await isSupabaseConnected();

  console.log(`Состояние Supabase для запросов OpenAI: Включен - ${isSupabaseEnabled}, Подключен - ${isSupabaseReady}`);
  
  if (isSupabaseEnabled && isSupabaseReady) {
    console.log('Использование Supabase Edge Function для вызова OpenAI API');
    try {
      const result = await searchViaOpenAI(prompt, options);
      console.log('Получен результат через Supabase Edge Function:', result);
      return result;
    } catch (error) {
      console.error('Ошибка при использовании Supabase для OpenAI:', error);
      toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
      
      // Проверяем включен ли фоллбэк, прежде чем продолжить с прямым вызовом
      const useDirectFallback = await isFallbackEnabled();
      if (useDirectFallback) {
        toast.info('Используем прямой вызов API как запасной вариант', { duration: 2000 });
        console.log('Активирован фоллбэк на прямой вызов OpenAI API');
      } else {
        throw error; // Если фоллбэк отключен, пробрасываем ошибку дальше
      }
    }
  } else {
    console.log('Supabase не используется или не подключен, пытаемся выполнить прямой запрос к OpenAI API');
  }

  try {
    // Инициализируем счетчик попыток, если он не был передан
    const retryAttempt = options.retryAttempt || 0;
    
    // Если исчерпаны все попытки, показываем ошибку
    if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
      toast.error(`Не удалось выполнить запрос к OpenAI API. Попробуйте позже.`, { duration: 5000 });
      throw new Error("Исчерпаны все попытки подключения к OpenAI API");
    }
    
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    throw new Error("CORS блокирует прямой доступ к OpenAI API. Используйте Supabase Edge Function.");

    // Прямой вызов API заблокирован из-за CORS, поэтому код ниже не будет исполнен
    console.log(`Отправляем запрос к OpenAI API...`);
    
    const defaultOptions = {
      model: "gpt-4o", // Используем gpt-4o как базовую модель
      temperature: 0.2,
      max_tokens: 500,
      responseFormat: "text" as "json_object" | "text"
    };
    
    const finalOptions = { ...defaultOptions, ...options, retryAttempt };
    
    // Формируем тело запроса
    const requestBody: any = {
      model: finalOptions.model,
      temperature: finalOptions.temperature,
      max_tokens: finalOptions.max_tokens,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };
    
    // Добавляем формат ответа, если задан JSON
    if (finalOptions.responseFormat === "json_object") {
      requestBody.response_format = { type: "json_object" };
      console.log("Запрашиваем ответ в формате JSON");
    }

    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Увеличиваем таймаут до 15 секунд

    console.log(`Отправка запроса к OpenAI с параметрами:`, {
      model: finalOptions.model,
      temperature: finalOptions.temperature,
      max_tokens: finalOptions.max_tokens,
      responseFormat: finalOptions.responseFormat
    });

    // Выполняем прямой запрос к API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    // Очищаем таймаут
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Не удалось прочитать ответ" } }));
      const errorMessage = errorData.error?.message || 'Неизвестная ошибка';
      
      console.error('Ошибка от API OpenAI:', errorMessage, 'Полный ответ:', errorData);
      
      // Проверяем специфические ошибки и даем понятные сообщения
      if (errorMessage.includes("quota")) {
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
        throw new Error("Превышен лимит запросов OpenAI API");
      } else if (errorMessage.includes("invalid")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
        throw new Error("Недействительный API ключ");
      } else {
        toast.error(`Ошибка OpenAI API: ${errorMessage}`, { duration: 5000 });
        throw new Error(`Ошибка OpenAI API: ${errorMessage}`);
      }
    }

    const data = await response.json();
    console.log('Получен ответ от OpenAI:', JSON.stringify(data).substring(0, 300) + '...');
    
    const content = data.choices[0]?.message?.content;
    console.log('Содержимое ответа OpenAI (первые 300 символов):', 
                typeof content === 'string' ? content.substring(0, 300) + '...' : 'Не строка');
    
    // Используем общую утилиту для обработки ответа
    return processApiResponse(content, finalOptions.responseFormat);

  } catch (error: any) {
    // Обработка ошибок без использования прокси
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Используем обработчик сетевых ошибок
    return handleNetworkError(error, prompt, options);
  }
};

// Функция для проверки, включен ли фоллбэк на прямые вызовы
async function isFallbackEnabled(): Promise<boolean> {
  try {
    const { isFallbackEnabled } = await import("../supabase/config");
    return isFallbackEnabled();
  } catch (e) {
    console.error('Ошибка при проверке статуса фоллбэка:', e);
    return false;
  }
}

// Экспортируем функцию поиска из отдельного файла
export { fetchFromOpenAI } from './searchService';
