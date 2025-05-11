
import { toast } from "sonner";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<any> => {
  let errorMessage = '';
  let errorDetails = null;
  
  console.log(`----- ОБРАБОТКА ОШИБКИ API -----`);
  console.log(`Статус ответа: ${response.status} ${response.statusText}`);
  console.log(`URL запроса: ${response.url}`);
  
  // Получаем все заголовки для диагностики
  const headers = Object.fromEntries([...response.headers.entries()]);
  console.log('ЗАГОЛОВКИ ОТВЕТА С ОШИБКОЙ:', headers);
  
  try {
    // Пытаемся получить ответ как JSON для более подробного анализа
    const errorResponse = await response.json();
    errorMessage = errorResponse.message || errorResponse.error?.message || `Ошибка API: ${response.status}`;
    errorDetails = errorResponse;
    
    console.error('ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О JSON-ОШИБКЕ:', {
      status: response.status,
      url: response.url,
      errorData: JSON.stringify(errorResponse).substring(0, 500)
    });
    
    // Если это ошибка от Google API, более подробно логируем её структуру
    if (response.url.includes('googleapis.com') && errorResponse.error) {
      console.error('СТРУКТУРА ОШИБКИ GOOGLE API:', {
        code: errorResponse.error.code,
        message: errorResponse.error.message,
        errors: errorResponse.error.errors,
        status: errorResponse.error.status,
        details: errorResponse.error.details
      });
    }
    
    // Если это ошибка от OpenAI API
    if (response.url.includes('openai.com') && errorResponse.error) {
      console.error('СТРУКТУРА ОШИБКИ OPENAI API:', {
        type: errorResponse.error.type,
        message: errorResponse.error.message,
        param: errorResponse.error.param,
        code: errorResponse.error.code
      });
    }
  } catch (e) {
    console.log('Не удалось распарсить ответ как JSON, пробуем получить текст...');
    try {
      errorMessage = await response.text() || `Ошибка API: ${response.status}`;
      console.error('ТЕКСТ ОШИБКИ API:', errorMessage.substring(0, 500));
    } catch (e2) {
      errorMessage = `Ошибка API: ${response.status}`;
      console.error('Не удалось получить данные ошибки API ни в JSON, ни в текстовом формате');
    }
  }
  
  // Обработка ошибок Google API
  if (response.url.includes('googleapis.com')) {
    console.error(`ОШИБКА GOOGLE API ${response.status}: ${errorMessage}`);
    
    if (response.status === 403) {
      console.error(`Google API 403: ${errorMessage}`, errorDetails);
      
      // Специфическая обработка для ошибок Google API
      if (errorDetails && errorDetails.error && errorDetails.error.errors) {
        console.error('ДЕТАЛИ ОШИБКИ GOOGLE API:', errorDetails.error.errors);
        const googleError = errorDetails.error.errors[0];
        if (googleError && googleError.reason) {
          console.error(`Причина ошибки Google API: ${googleError.reason}`);
          
          if (googleError.reason === 'dailyLimitExceeded') {
            toast.error("Превышен дневной лимит запросов Google API. Попробуйте завтра или смените API-ключ.", { duration: 7000 });
          } else if (googleError.reason === 'quotaExceeded') {
            toast.error("Превышена квота запросов Google API. Смените API-ключ или подождите обновления квоты.", { duration: 7000 });
          } else if (googleError.reason === 'keyInvalid') {
            toast.error("Недействительный API-ключ Google. Проверьте правильность ключа.", { duration: 7000 });
          } else {
            toast.error(`Ошибка Google API: ${googleError.reason}`, { duration: 7000 });
          }
          
          // Добавляем подробный лог с информацией о запросе
          console.error('КОНТЕКСТ ЗАПРОСА GOOGLE API:', {
            url: response.url,
            status: response.status,
            reason: googleError.reason,
            message: googleError.message,
            domain: googleError.domain
          });
        }
      } else {
        toast.error("Превышен лимит запросов Google API или неверный ключ.", { duration: 5000 });
      }
      return null;
    }
  }
  
  // Обработка ошибок OpenAI API
  if (response.url.includes('openai.com')) {
    console.error(`ОШИБКА OPENAI API ${response.status}: ${errorMessage}`);
    
    if (response.status === 401) {
      toast.error("Недействительный API-ключ OpenAI. Проверьте правильность ключа в настройках.", { duration: 7000 });
      return null;
    } else if (response.status === 429) {
      toast.error("Превышен лимит запросов OpenAI API. Попробуйте позже или проверьте ваш тариф.", { duration: 7000 });
      return null;
    } else if (response.status === 400) {
      toast.error(`Ошибка в запросе к OpenAI API: ${errorMessage}`, { duration: 7000 });
      return null;
    }
  }
  
  // Проверяем количество оставшихся запросов в заголовках (для Zylalabs)
  const remainingCalls = headers['x-zyla-api-calls-monthly-remaining'];
  if (remainingCalls !== undefined) {
    console.log(`Осталось запросов к Zylalabs API: ${remainingCalls}`);
    // Предупреждаем пользователя, когда остается мало запросов
    if (parseInt(remainingCalls) < 10) {
      toast.warning(`Осталось всего ${remainingCalls} запросов к API. Скоро лимит будет исчерпан.`, { duration: 5000 });
    }
  }
  
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
  } else {
    toast.error('Ошибка при получении данных. Подробности в консоли.', { duration: 5000 });
  }
};
