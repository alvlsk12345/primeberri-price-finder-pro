
import { getApiKey } from "./config";

// Базовый URL API Perplexity
const API_BASE_URL = "https://api.perplexity.ai";

// Опции по умолчанию для запросов
const DEFAULT_OPTIONS = {
  model: "llama-3.1-sonar-small-128k-online",
  temperature: 0.1,
  max_tokens: 500
};

/**
 * Вызов Perplexity AI API
 * @param prompt Запрос к API
 * @param options Дополнительные параметры запроса
 * @returns Ответ от API
 */
export const callPerplexityAI = async (
  prompt: string,
  options: Record<string, any> = {}
): Promise<string> => {
  // Получаем API ключ
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API ключ Perplexity не установлен");
  }

  // Объединяем параметры по умолчанию с переданными
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  try {
    // Формируем тело запроса
    const requestBody = {
      model: mergedOptions.model || DEFAULT_OPTIONS.model,
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по брендам и товарам.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: mergedOptions.temperature || DEFAULT_OPTIONS.temperature,
      max_tokens: mergedOptions.max_tokens || DEFAULT_OPTIONS.max_tokens,
      return_images: false,
      return_related_questions: false
    };

    console.log('Отправляем запрос к Perplexity API:', {
      model: requestBody.model, 
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens
    });

    // Отправляем запрос к API
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // Проверяем успешность запроса
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      if (response.status === 401) {
        throw new Error("Недействительный API ключ Perplexity");
      }
      
      throw new Error(
        errorData?.error?.message || 
        `Ошибка API Perplexity: ${response.status} ${response.statusText}`
      );
    }

    // Получаем данные ответа
    const data = await response.json();
    
    // Извлекаем текст ответа
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Получен пустой ответ от Perplexity AI");
    }
    
    return content;
  } catch (error: any) {
    console.error("Ошибка при вызове Perplexity AI:", error);
    throw error;
  }
};
