
import { toast } from "sonner";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<any> => {
  let errorMessage = '';
  let errorDetails = null;
  
  try {
    const errorResponse = await response.json();
    errorMessage = errorResponse.message || `Ошибка API: ${response.status}`;
    errorDetails = errorResponse;
  } catch (e) {
    try {
      errorMessage = await response.text() || `Ошибка API: ${response.status}`;
    } catch (e2) {
      errorMessage = `Ошибка API: ${response.status}`;
    }
  }
  
  // Получение всех заголовков для анализа
  const headers = Object.fromEntries([...response.headers.entries()]);
  
  console.error('Ошибка от API Zylalabs:', {
    status: response.status,
    message: errorMessage,
    details: errorDetails,
    headers: headers
  });
  
  // Проверяем количество оставшихся запросов в заголовках
  const remainingCalls = headers['x-zyla-api-calls-monthly-remaining'];
  
  // Особая обработка для разных статусных кодов
  if (response.status === 401) {
    toast.error("Ошибка авторизации API. Проверьте ключ API.", { duration: 5000 });
    console.log("Используем демо-данные из-за ошибки авторизации API");
  } else if (response.status === 429) {
    const resetTime = headers['x-zyla-api-calls-reset-time'] || 'неизвестное время';
    toast.error(`Превышен лимит запросов API. Лимит будет восстановлен через: ${resetTime}.`, { duration: 5000 });
    console.log(`Используем демо-данные из-за превышения лимита API. Осталось запросов: ${remainingCalls || 0}`);
  } else if (response.status === 400) {
    toast.error(`Некорректный запрос: ${errorMessage}`, { duration: 5000 });
    console.log("Используем демо-данные из-за некорректного запроса API");
  } else if (response.status === 503) {
    toast.error(`Сервис Zylalabs временно недоступен. Используем демо-данные.`, { duration: 5000 });
    console.log("Используем демо-данные из-за недоступности API (503)");
  } else {
    toast.error(`Ошибка API (${response.status}): ${errorMessage}`, { duration: 5000 });
    console.log(`Используем демо-данные из-за ошибки API ${response.status}`);
  }
  
  // Возвращаем демо-данные вместо выбрасывания исключения
  return {
    data: null,
    products: [],
    totalPages: 1,
    isDemo: true,
    remainingCalls: '0',
    error: errorMessage
  };
};

/**
 * Handles general fetch errors and provides user feedback
 */
export const handleFetchError = (error: any): void => {
  // Логируем всю информацию об ошибке
  console.error('Ошибка при запросе к API:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause
  });
  
  if (error.name === 'AbortError') {
    console.warn('Запрос был отменен из-за истечения времени ожидания');
    toast.error('Превышено время ожидания ответа от сервера Zylalabs. Используем демо-данные.', { duration: 5000 });
  } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    toast.error('Проблема с сетью. Проверьте подключение к интернету. Используем демо-данные.', { duration: 5000 });
  } else if (error.message && error.message.includes('CORS')) {
    toast.error('Ошибка CORS при обращении к API. Используем демо-данные.', { duration: 5000 });
  } else {
    toast.error('Ошибка при получении данных о товарах. Используем демо-данные.', { duration: 5000 });
  }
};

/**
 * Генерирует демо данные в случае ошибок
 */
export const getFallbackSearchResults = (query: string, page: number = 1) => {
  return generateMockSearchResults(query, page);
};
