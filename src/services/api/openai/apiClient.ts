
import { toast } from "sonner";
import { getApiKey } from "./config";
import { 
  getCorsProxyUrl, 
  getCurrentProxyName 
} from "@/services/image/corsProxyService";
import { MAX_RETRY_ATTEMPTS, handleNetworkError } from "./proxyUtils";
import { processApiResponse } from "./responseUtils";

// Базовая функция для использования OpenAI API с обработкой ошибок и автоматическим переключением прокси
export const callOpenAI = async (prompt: string, options: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json_object" | "text";
  retryAttempt?: number; // Счетчик попыток
} = {}): Promise<any> => {
  try {
    // Инициализируем счетчик попыток, если он не был передан
    const retryAttempt = options.retryAttempt || 0;
    
    // Если исчерпаны все попытки с разными прокси, показываем ошибку
    if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
      toast.error(`Не удалось подключиться ни к одному из доступных CORS прокси. Попробуйте позже.`, { duration: 5000 });
      throw new Error("Исчерпаны все попытки подключения к CORS прокси");
    }
    
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log(`Отправляем запрос к OpenAI через прокси ${getCurrentProxyName()} (попытка ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})...`);
    
    const defaultOptions = {
      model: "gpt-4o-search-preview-2025-03-11", // Изменено с gpt-4o на новую модель, оптимизированную для поиска
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
    }

    // Используем CORS прокси для обхода ограничений
    const originalApiUrl = 'https://api.openai.com/v1/chat/completions';
    const proxyUrl = getCorsProxyUrl(originalApiUrl);

    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд

    // Выполняем запрос к API OpenAI через CORS прокси
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Original-Authorization': `Bearer ${apiKey}`, // Передаем API ключ в специальном заголовке для прокси
        'X-Requested-With': 'XMLHttpRequest'
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
        // Переключаемся на другой прокси и пытаемся снова через новую утилиту
        return handleNetworkError(
          new Error(errorMessage),
          prompt,
          finalOptions
        );
      }
    }

    const data = await response.json();
    console.log('Получен ответ от OpenAI:', data);
    
    const content = data.choices[0]?.message?.content;
    
    // Используем общую утилиту для обработки ответа
    return processApiResponse(content, finalOptions.responseFormat);

  } catch (error: any) {
    // Используем общую утилиту для обработки сетевых ошибок
    return handleNetworkError(error, prompt, options);
  }
};

// Экспортируем функцию поиска из отдельного файла
export { fetchFromOpenAI } from './searchService';
