
import { toast } from "@/components/ui/sonner";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = '';
  
  try {
    const errorText = await response.text();
    let errorResponse;
    try {
      errorResponse = JSON.parse(errorText);
      errorMessage = errorResponse.message || errorResponse.error || `Ошибка API: ${response.status}`;
    } catch (e) {
      errorMessage = errorText || `Ошибка API: ${response.status}`;
    }
  } catch (e) {
    errorMessage = `Ошибка API: ${response.status}`;
  }
  
  console.error('Ошибка от API Zylalabs:', errorMessage, 'Status:', response.status);
  
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
    console.warn('Сервис временно недоступен');
    throw new Error(`Сервис временно недоступен: ${errorMessage}`);
  } else {
    toast.error(`Ошибка API: ${errorMessage}`);
    throw new Error(`Ошибка API Zylalabs: ${errorMessage}`);
  }
};

/**
 * Handles general fetch errors and provides user feedback
 */
export const handleFetchError = (error: any): void => {
  if (error.name === 'AbortError') {
    console.warn('Запрос был отменен из-за истечения времени ожидания');
    toast.error('Превышено время ожидания ответа от сервера');
  } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    toast.error('Проблема с сетью. Проверьте подключение к интернету');
  } else {
    console.error('Ошибка API детали:', error);
    toast.error(`Ошибка при получении данных: ${error.message || 'Неизвестная ошибка'}`);
  }
  
  console.error('Ошибка при запросе к API:', error);
};
