
import { toast } from "sonner";
import { getApiKey } from "./config";
import { processApiResponse } from "./responseUtils";
import { isUsingSupabaseBackend } from "../supabase/config";
import { isSupabaseConnected } from "../supabase/client";
import { searchViaOpenAI } from "../supabase/aiService";

// Максимальное количество попыток запроса
const MAX_RETRY_ATTEMPTS = 2;

// Базовая функция для использования OpenAI API без CORS прокси
export const callOpenAI = async (prompt: string, options: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json_object" | "text";
  retryAttempt?: number;
} = {}): Promise<any> => {
  // Проверяем, используем ли мы Supabase бэкенд
  if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
    console.log('Использование Supabase для вызова OpenAI API');
    try {
      return await searchViaOpenAI(prompt, options);
    } catch (error) {
      console.error('Ошибка при использовании Supabase для OpenAI:', error);
      toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
      // Продолжаем с прямым вызовом API как запасной вариант
      toast.info('Используем прямой вызов API как запасной вариант', { duration: 2000 });
    }
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
      
      console.error('Ошибка от API OpenAI:', errorMessage);
      
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
    
    if (error.name === 'AbortError') {
      console.warn('Запрос был отменен из-за таймаута');
      toast.error("Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.", { duration: 3000 });
      
      // Получаем текущий номер попытки
      const retryAttempt = options.retryAttempt || 0;
      
      // Если не исчерпаны попытки, пробуем снова
      if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        return callOpenAI(prompt, {
          ...options,
          retryAttempt: retryAttempt + 1
        });
      }
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Ошибка сети при подключении к OpenAI API. Проверьте подключение к интернету.', { duration: 5000 });
      
      // Получаем текущий номер попытки
      const retryAttempt = options.retryAttempt || 0;
      
      // Если не исчерпаны попытки, пробуем снова
      if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        return callOpenAI(prompt, {
          ...options,
          retryAttempt: retryAttempt + 1
        });
      }
    }
    
    throw error;
  }
};

// Экспортируем функцию поиска из отдельного файла
export { fetchFromOpenAI } from './searchService';
