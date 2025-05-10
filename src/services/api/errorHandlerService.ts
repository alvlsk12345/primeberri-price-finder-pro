
import { toast } from "sonner";
import { switchToNextProxy } from "@/services/image/corsProxyService";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<any> => {
  let errorMessage = '';
  let errorDetails = null;
  
  try {
    const errorResponse = await response.json();
    errorMessage = errorResponse.message || errorResponse.error?.message || `Ошибка API: ${response.status}`;
    errorDetails = errorResponse;
    
    // Более подробное логирование данных ответа для диагностики
    console.error('Ошибка API с данными:', {
      status: response.status,
      url: response.url,
      errorData: errorResponse
    });
  } catch (e) {
    try {
      errorMessage = await response.text() || `Ошибка API: ${response.status}`;
      console.error('Текстовые данные ошибки API:', errorMessage);
    } catch (e2) {
      errorMessage = `Ошибка API: ${response.status}`;
      console.error('Не удалось получить данные ошибки API');
    }
  }
  
  // Получение всех заголовков для анализа
  const headers = Object.fromEntries([...response.headers.entries()]);
  
  console.error('Ошибка от API:', {
    status: response.status,
    message: errorMessage,
    details: errorDetails,
    headers: headers,
    url: response.url
  });
  
  // Обработка ошибок прокси
  if (response.status === 403 || response.status === 429) {
    console.warn('Ошибка CORS прокси, пробуем другой прокси...');
    switchToNextProxy();
    return null; // Возвращаем null, чтобы вызывающий код мог повторить запрос
  }
  
  // Обработка ошибок Google API
  if (response.url.includes('googleapis.com')) {
    if (response.status === 403) {
      console.error(`Google API 403: ${errorMessage}`, errorDetails);
      toast.error("Превышен лимит запросов Google API или неверный ключ.", { duration: 5000 });
      
      // Если есть подробности об ошибке, выводим их
      if (errorDetails && errorDetails.error && errorDetails.error.errors) {
        console.error('Детали ошибки Google API:', errorDetails.error.errors);
        const googleError = errorDetails.error.errors[0];
        if (googleError && googleError.reason) {
          console.error(`Причина ошибки Google API: ${googleError.reason}`);
          
          if (googleError.reason === 'dailyLimitExceeded') {
            toast.error("Превышен дневной лимит запросов Google API. Попробуйте завтра или смените API-ключ.", { duration: 7000 });
          } else if (googleError.reason === 'quotaExceeded') {
            toast.error("Превышена квота запросов Google API. Смените API-ключ или подождите обновления квоты.", { duration: 7000 });
          } else if (googleError.reason === 'keyInvalid') {
            toast.error("Недействительный API-ключ Google. Проверьте правильность ключа.", { duration: 7000 });
          }
        }
      }
      return null;
    } else if (response.status === 400) {
      toast.error(`Google API: ${errorMessage}`, { duration: 5000 });
      return null;
    }
  }
  
  // Проверяем количество оставшихся запросов в заголовках (для Zylalabs)
  const remainingCalls = headers['x-zyla-api-calls-monthly-remaining'];
  
  // Особая обработка для разных статусных кодов
  if (response.status === 401) {
    toast.error("Ошибка авторизации API. Проверьте ключ API.", { duration: 5000 });
    throw new Error("Ошибка авторизации API. Проверьте ключ API.");
  } else if (response.status === 429) {
    const resetTime = headers['x-zyla-api-calls-reset-time'] || 'неизвестное время';
    toast.error(`Превышен лимит запросов API. Лимит будет восстановлен через: ${resetTime}.`, { duration: 5000 });
    throw new Error(`Превышен лимит запросов API. Лимит будет восстановлен через: ${resetTime}.`);
  } else if (response.status === 400) {
    toast.error(`Некорректный запрос: ${errorMessage}`, { duration: 5000 });
    throw new Error(`Некорректный запрос: ${errorMessage}`);
  } else if (response.status === 503) {
    console.warn('Сервис временно недоступен (503).');
    toast.error(`Сервис временно недоступен. Попробуем другие параметры.`, { duration: 3000 });
    // Вместо ошибки возвращаем null для возможности более мягкой обработки
    return null;
  } else if (response.status === 403) {
    toast.error("Доступ запрещен. Проверьте права API ключа.", { duration: 5000 });
    throw new Error("Доступ запрещен. Проверьте права API ключа (403).");
  } else if (response.status === 404) {
    toast.error("Требуемый ресурс не найден. Проверьте URL API.", { duration: 5000 });
    throw new Error("Требуемый ресурс не найден. Проверьте URL API (404).");
  } else {
    toast.error(`Ошибка API (${response.status}): ${errorMessage}`, { duration: 5000 });
    throw new Error(`Ошибка API (${response.status}): ${errorMessage}`);
  }
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
    toast.error('Превышено время ожидания ответа от сервера. Пробуем другие параметры.', { duration: 3000 });
  } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    toast.error('Проблема с сетью. Проверьте подключение к интернету.', { duration: 5000 });
  } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    toast.error('Ошибка соединения при обращении к API. Пробуем другие параметры.', { duration: 3000 });
    switchToNextProxy(); // Переключаемся на следующий прокси при ошибке соединения
  } else {
    toast.error('Ошибка при получении данных о товарах.', { duration: 5000 });
  }
};
