
import { toast } from "sonner";
import { 
  getCorsProxyUrl, 
  switchToNextProxy, 
  getCurrentProxyName,
  getMaxProxyAttempts
} from "@/services/image/corsProxyService";

// Максимальное количество попыток запроса с разными прокси
export const MAX_RETRY_ATTEMPTS = getMaxProxyAttempts();

// Вспомогательная функция для обработки сетевых ошибок
export const handleNetworkError = async (error: any, prompt: string, options: any): Promise<any> => {
  console.error('Ошибка при запросе к OpenAI:', error);
  
  // Обработка ошибок сети - переключаем прокси и повторяем запрос
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    console.warn(`Ошибка соединения с прокси ${getCurrentProxyName()}, пробуем следующий...`);
    
    // Переключаемся на следующий прокси
    switchToNextProxy();
    
    // Получаем текущий номер попытки
    const retryAttempt = options.retryAttempt || 0;
    
    // Если не исчерпаны попытки, пробуем снова
    if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
      return callOpenAI(prompt, {
        ...options,
        retryAttempt: retryAttempt + 1
      });
    } else {
      toast.error("Не удалось подключиться к API. Возможная причина - ограничение CORS или проблема с сетью.", { duration: 5000 });
    }
  } else if (error.name === 'AbortError') {
    console.warn('Запрос был отменен из-за таймаута');
    toast.error("Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.", { duration: 3000 });
    
    // Переключаемся на следующий прокси и пытаемся снова
    switchToNextProxy();
    
    // Получаем текущий номер попытки
    const retryAttempt = options.retryAttempt || 0;
    
    // Если не исчерпаны попытки, пробуем снова
    if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
      return callOpenAI(prompt, {
        ...options,
        retryAttempt: retryAttempt + 1
      });
    }
  }
  
  throw error;
};

// Импортируем функцию callOpenAI для возможности рекурсивного вызова
import { callOpenAI } from "./apiClient";
