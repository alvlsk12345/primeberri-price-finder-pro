
import { toast } from "@/components/ui/sonner";

/**
 * Handles API response errors based on status codes
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = '';
  
  try {
    const errorText = await response.text();
    console.log("Raw error response:", errorText, "Status:", response.status);
    
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
  
  console.error('Ошибка от API:', errorMessage, 'Status:', response.status);
  
  // Особая обработка для разных статусных кодов
  if (response.status === 401) {
    toast.error("Ошибка авторизации API. Проверьте ключ API.");
    throw new Error("Ошибка авторизации API");
  } else if (response.status === 429) {
    toast.error("Превышен лимит запросов API. Пожалуйста, попробуйте позже.");
    throw new Error("Превышен лимит запросов API");
  } else if (response.status === 400) {
    toast.error(`Некорректный запрос: ${errorMessage}`);
    throw new Error(`Некорректный запрос: ${errorMessage}`);
  } else if (response.status === 503 || response.status === 502 || response.status === 504) {
    console.warn('Сервис временно недоступен');
    throw new Error(`Сервис временно недоступен: ${errorMessage}`);
  } else if (response.status === 403) {
    // Особая обработка для CORS ошибок
    if (errorMessage.includes('/corsdemo')) {
      console.warn('CORS прокси требует активацию, попробуем другой прокси');
      throw new Error('CORS прокси требует активацию');
    }
    toast.error(`Доступ запрещен (403): ${errorMessage}`);
    throw new Error(`Доступ запрещен: ${errorMessage}`);
  } else {
    toast.error(`Ошибка API: ${errorMessage}`);
    throw new Error(`Ошибка API: ${errorMessage}`);
  }
};

/**
 * Handles general fetch errors and provides user feedback
 */
export const handleFetchError = (error: any): void => {
  console.error("Full error object:", error);
  
  if (error.name === 'AbortError') {
    console.warn('Запрос был отменен из-за истечения времени ожидания');
    toast.error('Превышено время ожидания ответа от сервера');
  } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
    toast.error('Проблема с сетью. Проверьте подключение к интернету');
  } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    toast.error('Не удалось подключиться к API. Пробуем альтернативные методы подключения...');
    console.log('Произошла ошибка "Failed to fetch", возможно проблема с CORS или с сетевым соединением');
  } else {
    console.error('Ошибка API детали:', error);
    toast.error(`Ошибка при получении данных: ${error.message || 'Неизвестная ошибка'}`);
  }
  
  console.error('Ошибка при запросе к API:', error);
};
