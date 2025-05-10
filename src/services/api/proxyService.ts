
import { toast } from "sonner";
import { getProxyAuthHeader, getProxyUrl } from "./proxyConfig";

/**
 * Выполнение запроса через HTTP-прокси
 * @param url URL для запроса
 * @param options Опции запроса (опционально)
 * @returns Promise с результатом запроса
 */
export const fetchWithProxy = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    console.log(`Выполняем запрос через прокси: ${url}`);
    
    // Объединяем существующие заголовки с заголовками прокси
    const headers = {
      ...options.headers,
      'Proxy-Authorization': getProxyAuthHeader(),
    };
    
    // Ограничиваем время ожидания ответа от прокси (15 секунд)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('Успешный ответ от прокси');
      } else {
        console.error(`Ошибка от прокси: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Проверяем, был ли запрос прерван по таймауту
      if (fetchError.name === 'AbortError') {
        console.error('Превышено время ожидания ответа от прокси');
        throw new Error('Превышено время ожидания ответа от прокси');
      }
      
      console.error('Ошибка при выполнении запроса через прокси:', fetchError);
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Ошибка прокси-сервиса:', error);
    
    // Если прокси недоступен, выполняем запрос напрямую
    console.log('Выполняем запрос напрямую без прокси...');
    
    try {
      return await fetch(url, {
        ...options,
        mode: 'cors'
      });
    } catch (directError: any) {
      console.error('Ошибка при прямом запросе:', directError);
      toast.error('Не удалось выполнить запрос. Проверьте подключение к интернету.');
      throw directError;
    }
  }
};

/**
 * Проверка доступности прокси-сервера
 * @returns Promise с результатом проверки
 */
export const checkProxyAvailability = async (): Promise<boolean> => {
  try {
    console.log('Проверка доступности прокси-сервера...');
    
    // Простой запрос для проверки прокси
    const response = await fetchWithProxy('https://api.ipify.org?format=json');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Прокси доступен. IP: ${data.ip}`);
      return true;
    }
    
    console.error('Прокси недоступен');
    return false;
  } catch (error) {
    console.error('Ошибка при проверке прокси:', error);
    return false;
  }
};

/**
 * Преобразование URL для использования с прокси
 * @param url URL для преобразования
 * @returns Преобразованный URL для прокси
 */
export const getProxyEnabledUrl = (url: string): string => {
  // Для современных браузеров прямое использование прокси не требует изменения URL
  return url;
};
