
import { toast } from "sonner";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<never> => {
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
  
  console.error('Ошибка от API Zylalabs:', {
    status: response.status,
    message: errorMessage,
    details: errorDetails,
    headers: Object.fromEntries([...response.headers.entries()])
  });
  
  // Особая обработка для разных статусных кодов
  if (response.status === 401) {
    toast.error("Ошибка авторизации API. Проверьте ключ API.");
    throw new Error("Ошибка авторизации API Zylalabs");
  } else if (response.status === 429) {
    toast.error("Превышен лимит запросов API. Пожалуйста, попробуйте позже.");
    throw new Error("Превышен лимит запросов API Zylalabs");
  } else if (response.status === 400) {
    toast.error(`Некорректный запрос: ${errorMessage}`);
    throw new Error(`Некорректный запрос: ${errorMessage}`);
  } else if (response.status === 503) {
    toast.error(`Сервис Zylalabs временно недоступен`);
    throw new Error(`Сервис временно недоступен: ${errorMessage}`);
  } else {
    toast.error(`Ошибка API (${response.status}): ${errorMessage}`);
    throw new Error(`Ошибка API Zylalabs: ${errorMessage}`);
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
    toast.error('Превышено время ожидания ответа от сервера Zylalabs');
  } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    toast.error('Проблема с сетью. Проверьте подключение к интернету');
  } else if (error.message && error.message.includes('CORS')) {
    toast.error('Ошибка CORS при обращении к API. Это может быть связано с ограничениями безопасности браузера.');
  } else {
    toast.error('Ошибка при получении данных о товарах');
  }
};
