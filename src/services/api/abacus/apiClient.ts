import { toast } from "sonner";
import { getApiKey, API_BASE_URL } from "./config";
import { isUsingSupabaseBackend } from "../supabase/config";
import { searchViaAbacus } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";

// Базовая функция для использования Abacus.ai API с обработкой ошибок (без CORS-прокси)
export const callAbacusAI = async (
  endpoint: string, 
  method: 'GET' | 'POST' = 'POST',
  requestData: Record<string, any> = {},
  options: {
    retryAttempt?: number;
  } = {}
): Promise<any> => {
  // Проверяем, используем ли мы Supabase бэкенд
  if (isUsingSupabaseBackend() && isSupabaseConnected()) {
    console.log(`Использование Supabase для вызова Abacus.ai API: ${endpoint}`);
    try {
      // Используем Supabase Edge Function для вызова Abacus.ai
      // Исправляем передачу параметров - правильно передаем метод как второй аргумент, а данные как третий
      return await searchViaAbacus(endpoint, method, requestData);
    } catch (error) {
      console.error('Ошибка при использовании Supabase для Abacus.ai:', error);
      toast.error(`Ошибка Supabase для Abacus.ai: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
      // Продолжаем с прямым вызовом API как запасной вариант
      toast.info('Используем прямой вызов API Abacus.ai как запасной вариант', { duration: 2000 });
    }
  }

  try {
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ Abacus.ai не установлен");
    }

    console.log(`Отправляем запрос к Abacus.ai API...`);
    
    // Формируем полный URL эндпоинта
    let fullUrl = `${API_BASE_URL}/${endpoint}`;
    
    // Для GET-запросов добавляем параметры в URL
    if (method === 'GET' && Object.keys(requestData).length > 0) {
      const params = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      fullUrl += `?${params.toString()}`;
    }
    
    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд

    // Опции для запроса
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    };
    
    // Добавляем тело запроса для POST-запросов
    if (method === 'POST' && Object.keys(requestData).length > 0) {
      fetchOptions.body = JSON.stringify(requestData);
    }

    // Выполняем прямой запрос к API без CORS прокси
    const response = await fetch(fullUrl, fetchOptions);

    // Очищаем таймаут
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Не удалось прочитать ответ" } }));
      const errorMessage = errorData.error || errorData.errorType || 'Неизвестная ошибка';
      
      console.error('Ошибка от API Abacus.ai:', errorMessage);
      
      toast.error(`Ошибка Abacus.ai API: ${errorMessage}`, { duration: 5000 });
      throw new Error(`Ошибка Abacus.ai API: ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log('Получен ответ от Abacus.ai:', responseData);
    
    // Проверяем успешность запроса по полю success в ответе
    if (responseData && responseData.success === false) {
      throw new Error(responseData.error || "Неизвестная ошибка API");
    }
    
    // Возвращаем результат запроса
    return responseData.result || responseData;

  } catch (error: any) {
    console.error('Ошибка при запросе к Abacus.ai:', error);
    
    // Проверяем, является ли ошибка таймаутом или сетевой ошибкой
    if (error.name === 'AbortError') {
      toast.error('Превышено время ожидания ответа от Abacus.ai API', { duration: 5000 });
      throw new Error('Превышено время ожидания ответа от Abacus.ai API');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Ошибка сети при подключении к Abacus.ai API. Проверьте подключение к интернету.', { duration: 5000 });
      throw new Error('Ошибка сети при подключении к Abacus.ai API');
    }
    
    // Если это критическая ошибка, пробрасываем ошибку дальше
    throw error;
  }
};

// Функция для поиска товаров через Abacus.ai API
export const searchProductsViaAbacus = async (query: string, options: any = {}): Promise<any> => {
  try {
    // Предполагаем, что у Abacus.ai есть API для поиска продуктов
    const searchData = {
      query,
      ...options
    };
    
    // Вызываем API для поиска товаров
    // Примечание: нужно заменить 'searchProducts' на реальный эндпоинт Abacus.ai API
    const result = await callAbacusAI('searchProducts', 'POST', searchData);
    
    return result;
  } catch (error) {
    console.error('Ошибка при поиске товаров через Abacus.ai:', error);
    throw error;
  }
};

// Функция для генерации текста через Abacus.ai API
export const generateTextViaAbacus = async (prompt: string, options: any = {}): Promise<string> => {
  try {
    const data = {
      prompt,
      ...options
    };
    
    // Вызываем API для генерации текста
    // Примечание: нужно заменить 'textGeneration' на реальный эндпоинт Abacus.ai API
    const result = await callAbacusAI('textGeneration', 'POST', data);
    
    // Предполагаем, что результат содержит поле text с сгенерированным текстом
    return result.text || result.generated_text || JSON.stringify(result);
  } catch (error) {
    console.error('Ошибка при генерации текста через Abacus.ai:', error);
    throw error;
  }
};
