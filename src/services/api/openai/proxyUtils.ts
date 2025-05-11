import { toast } from "sonner";

// Максимальное количество попыток запроса
export const MAX_RETRY_ATTEMPTS = 2;

// Интерфейс для опций запроса к OpenAI
export interface OpenAIRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json_object" | "text";
  retryAttempt?: number;
  n?: number;
  stop?: string[];
}

// Интерфейс для функции обработки ошибок
export type ErrorHandlerFunction = (error: any, prompt: string, options: OpenAIRequestOptions) => Promise<any>;

// Фабричная функция для создания обработчика сетевых ошибок
export const createNetworkErrorHandler = (callOpenAI: (prompt: string, options: OpenAIRequestOptions) => Promise<any>): ErrorHandlerFunction => {
  return async (error: any, prompt: string, options: OpenAIRequestOptions): Promise<any> => {
    console.error('Ошибка при запросе к OpenAI:', error);
    
    // Обработка ошибок сети - повторяем запрос
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn(`Ошибка соединения с OpenAI API, пробуем повторить запрос...`);
      
      // Получаем текущий номер попытки
      const retryAttempt = options.retryAttempt || 0;
      
      // Если не исчерпаны попытки, пробуем снова
      if (retryAttempt < MAX_RETRY_ATTEMPTS - 1) {
        return callOpenAI(prompt, {
          ...options,
          retryAttempt: retryAttempt + 1
        });
      } else {
        toast.error("Не удалось подключиться к API. Возможная причина - проблема с сетью.", { duration: 5000 });
      }
    } else if (error.name === 'AbortError') {
      console.warn('Запрос был отменен из-за таймаута');
      toast.error("Превышено время ожидания ответа от сервера. Проверьте подключение к интернету.", { duration: 3000 });
      
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
};
