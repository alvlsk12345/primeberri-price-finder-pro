
import { toast } from "sonner";
import { getApiKey, API_BASE_URL } from "./config";
import { getCorsProxyUrl, getCurrentProxyName, switchToNextProxy } from "@/services/image/corsProxyService";
import { MAX_RETRY_ATTEMPTS } from "../openai/proxyUtils";

// Базовая функция для использования Abacus.ai API с обработкой ошибок
export const callAbacusAI = async (
  endpoint: string, 
  method: 'GET' | 'POST' = 'POST',
  requestData: Record<string, any> = {},
  options: {
    retryAttempt?: number;
  } = {}
): Promise<any> => {
  try {
    // Инициализируем счетчик попыток, если он не был передан
    const retryAttempt = options.retryAttempt || 0;
    
    // Если исчерпаны все попытки с разными прокси, показываем ошибку
    if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
      toast.error(`Не удалось подключиться к Abacus.ai API. Попробуйте позже.`, { duration: 5000 });
      throw new Error("Исчерпаны все попытки подключения к Abacus.ai API");
    }
    
    // Получаем API ключ из localStorage
    const apiKey = getApiKey();
    
    // Проверка на корректность ключа API
    if (!apiKey) {
      toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ Abacus.ai не установлен");
    }

    console.log(`Отправляем запрос к Abacus.ai через прокси ${getCurrentProxyName()} (попытка ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})...`);
    
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
    
    // Используем CORS прокси для обхода ограничений
    const proxyUrl = getCorsProxyUrl(fullUrl);

    // Вводим таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд

    // Опции для запроса
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Original-apiKey': apiKey, // Передаем API ключ в специальном заголовке для прокси
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: controller.signal
    };
    
    // Добавляем тело запроса для POST-запросов
    if (method === 'POST' && Object.keys(requestData).length > 0) {
      fetchOptions.body = JSON.stringify(requestData);
    }

    // Выполняем запрос к API через CORS прокси
    const response = await fetch(proxyUrl, fetchOptions);

    // Очищаем таймаут
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Не удалось прочитать ответ" } }));
      const errorMessage = errorData.error || errorData.errorType || 'Неизвестная ошибка';
      
      console.error('Ошибка от API Abacus.ai:', errorMessage);
      
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
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      // Если это не последняя попытка, пробуем снова через другой прокси
      const currentRetryAttempt = options.retryAttempt || 0;
      
      if (currentRetryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        console.log('Переключаемся на другой прокси и повторяем запрос...');
        
        // Переключаемся на следующий прокси
        await switchToNextProxy();
        
        // Повторяем запрос с увеличенным счетчиком попыток
        return callAbacusAI(endpoint, method, requestData, {
          ...options,
          retryAttempt: currentRetryAttempt + 1
        });
      }
    }
    
    // Если это критическая ошибка или все попытки исчерпаны, пробрасываем ошибку дальше
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
