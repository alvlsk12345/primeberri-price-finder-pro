
import { toast } from "sonner";
import { getApiKey, BASE_URL, REQUEST_TIMEOUT } from "./config";

// Типы для API запросов и ответов
type AbacusApiResponse<T> = {
  success: boolean;
  result?: T;
  error?: string;
  errorType?: string;
};

/**
 * Базовая функция для выполнения запросов к Abacus.AI API
 * @param endpoint Конечная точка API
 * @param method HTTP метод (GET или POST)
 * @param params Параметры запроса
 * @returns Результат запроса
 */
export const callAbacusApi = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET', 
  params: Record<string, any> = {}
): Promise<T> => {
  try {
    // Получаем API ключ
    const apiKey = getApiKey();
    
    if (!apiKey) {
      toast.error("API ключ Abacus не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ Abacus не установлен");
    }

    // Полный URL запроса
    const url = new URL(`${BASE_URL}/${endpoint}`);
    
    // Заголовки запроса
    const headers: HeadersInit = {
      'apiKey': apiKey,
      'Content-Type': 'application/json',
    };

    let response: Response;
    
    // Выполняем запрос в зависимости от метода
    if (method === 'GET') {
      // Добавляем параметры запроса к URL
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, String(params[key]));
        }
      });
      
      // Создаем контроллер для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      // Выполняем GET запрос
      response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } else {
      // Создаем контроллер для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      // Выполняем POST запрос с телом запроса
      response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    }

    // Проверяем успешность ответа
    if (!response.ok) {
      let errorMessage = `Ошибка API Abacus: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Если не удалось распарсить JSON, оставляем оригинальное сообщение об ошибке
      }
      
      console.error('Ошибка от API Abacus:', errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Парсим ответ как JSON
    const data: AbacusApiResponse<T> = await response.json();
    
    // Проверяем успешность ответа
    if (!data.success) {
      const errorMessage = data.error || 'Неизвестная ошибка от Abacus API';
      console.error('Ошибка в ответе Abacus API:', errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Возвращаем результат
    return data.result as T;
    
  } catch (error: any) {
    // Определяем, является ли ошибка таймаутом
    if (error.name === 'AbortError') {
      const timeoutError = 'Превышено время ожидания ответа от Abacus API';
      console.error(timeoutError);
      toast.error(timeoutError);
      throw new Error(timeoutError);
    }
    
    console.error('Ошибка при запросе к Abacus API:', error);
    throw error;
  }
};
