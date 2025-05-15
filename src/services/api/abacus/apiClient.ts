
import { toast } from "sonner";
import { getApiKey, API_BASE_URL } from "./config";
import { isUsingSupabaseBackend } from "../supabase/config";
import { searchViaPerplexity } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";
import { BrandSuggestion, SearchParams } from "@/services/types";

// Базовая функция для использования Perplexity API с обработкой ошибок
export const callPerplexityAI = async (
  action: string,
  method: 'GET' | 'POST' = 'POST',
  requestData: Record<string, any> = {},
  options: {
    retryAttempt?: number;
  } = {}
): Promise<any> => {
  // Проверяем, используем ли мы Supabase бэкенд
  if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
    console.log(`Использование Supabase для вызова Perplexity API: ${action}`);
    try {
      // Используем Supabase Edge Function для вызова Perplexity
      const searchParams = { query: action } as SearchParams;
      return await searchViaPerplexity(searchParams, method, requestData);
    } catch (error) {
      console.error('Ошибка при использовании Supabase для Perplexity:', error);
      toast.error(`Ошибка Supabase для Perplexity: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
      // Продолжаем с прямым вызовом API как запасной вариант
      toast.info('Используем прямой вызов API Perplexity как запасной вариант', { duration: 2000 });
    }
  }

  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ Perplexity не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ Perplexity не установлен");
    }

    console.log(`Отправляем запрос к Perplexity API...`);
    
    // Формируем эндпоинт в зависимости от действия
    let endpoint = 'chat/completions';
    
    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд

    // Заменяем модель на "sonar-small", если указана другая модель
    if (requestData.model === "sonar" || requestData.model === "llama-3-sonar-large-32k-chat") {
      requestData.model = "sonar-small";
    }
    
    // Обновляем max_tokens до 300, если больше
    if (requestData.max_tokens > 300) {
      requestData.max_tokens = 300;
    }
    
    // Удаляем параметр response_format если он есть, так как он вызывает ошибку
    if (requestData.response_format) {
      delete requestData.response_format;
    }

    // Опции для запроса
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    };
    
    // Добавляем тело запроса для POST-запросов
    if (method === 'POST' && Object.keys(requestData).length > 0) {
      fetchOptions.body = JSON.stringify(requestData);
    }

    // Выполняем прямой запрос к API
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, fetchOptions);

    // Очищаем таймаут
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Не удалось прочитать ответ" } }));
      const errorMessage = errorData.error || errorData.message || 'Неизвестная ошибка';
      
      console.error('Ошибка от API Perplexity:', errorMessage);
      
      toast.error(`Ошибка Perplexity API: ${errorMessage}`, { duration: 5000 });
      throw new Error(`Ошибка Perplexity API: ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log('Получен ответ от Perplexity:', responseData);
    
    // Проверяем успешность запроса
    if (responseData && responseData.error) {
      throw new Error(responseData.error || "Неизвестная ошибка API");
    }
    
    // Возвращаем результат запроса
    return responseData;

  } catch (error: any) {
    console.error('Ошибка при запросе к Perplexity:', error);
    
    // Проверяем, является ли ошибка таймаутом или сетевой ошибкой
    if (error.name === 'AbortError') {
      toast.error('Превышено время ожидания ответа от Perplexity API', { duration: 5000 });
      throw new Error('Превышено время ожидания ответа от Perplexity API');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Ошибка сети при подключении к Perplexity API. Проверьте подключение к интернету.', { duration: 5000 });
      throw new Error('Ошибка сети при подключении к Perplexity API');
    }
    
    // Если это критическая ошибка, пробрасываем ошибку дальше
    throw error;
  }
};

// Функция для получения предложений брендов через Perplexity API
export const searchProductsViaAbacus = async (query: string, options: any = {}): Promise<any> => {
  try {
    // Системный промпт для формата JSON
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;
    
    // Формируем данные для запроса
    const requestData = {
      model: "sonar-small", // Заменено на sonar-small
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 300 // Уменьшено с 1000 до 300
    };
    
    // Вызываем API для поиска товаров
    const result = await callPerplexityAI('getBrandSuggestions', 'POST', requestData);
    
    // Извлекаем содержимое ответа
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("Пустой ответ от Perplexity API");
      return [];
    }
    
    try {
      const data = JSON.parse(content);
      if (data && data.products && Array.isArray(data.products)) {
        console.log("Успешно получен массив products от Perplexity:", data.products.length);
        return data;
      } else {
        console.error("Некорректный формат JSON от Perplexity или отсутствует массив 'products':", data);
        return { products: [] };
      }
    } catch (parseError) {
      console.error("Ошибка при парсинге JSON от Perplexity:", parseError);
      return { products: [] };
    }
    
  } catch (error) {
    console.error('Ошибка при поиске товаров через Perplexity:', error);
    throw error;
  }
};

// Функция для генерации текста через Perplexity API
export const generateTextViaAbacus = async (prompt: string, options: any = {}): Promise<string> => {
  try {
    const data = {
      model: "sonar-small", // Заменено на sonar-small
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300 // Уменьшено с 1000 до 300
    };
    
    // Вызываем API для генерации текста
    const result = await callPerplexityAI('generateText', 'POST', data);
    
    // Предполагаем, что результат содержит поле с сгенерированным текстом
    return result.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Ошибка при генерации текста через Perplexity:', error);
    throw error;
  }
};
