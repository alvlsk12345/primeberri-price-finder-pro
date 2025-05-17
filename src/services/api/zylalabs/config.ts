
/**
 * Имя API ключа в local storage
 */
export const ZYLALABS_API_KEY = 'zylalabs-api-key';

/**
 * Базовый URL для API запросов
 * Важно: использует дефисы вместо пробелов в формате URL
 */
export const BASE_URL = 'https://api.zylalabs.com/api/2033/real-time-product-search-api/1809/search-products';

/**
 * Таймаут для запросов в миллисекундах (30 секунд)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Получает API ключ сначала из localStorage
 * @returns API ключ или пустую строку
 */
export const getApiKey = async (): Promise<string> => {
  try {
    // В первую очередь проверяем localStorage
    const localKey = localStorage.getItem(ZYLALABS_API_KEY);
    if (localKey) {
      console.log('API ключ получен из localStorage');
      return localKey;
    }
    
    // Если в localStorage нет, возвращаем пустую строку
    console.log('API ключ не найден');
    return '';
  } catch (e) {
    console.error('Ошибка при получении API ключа:', e);
    return '';
  }
};

/**
 * Сохраняет API ключ в localStorage
 * @param apiKey API ключ для сохранения
 * @returns true если успешно сохранен
 */
export const setApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Сохраняем в localStorage
    localStorage.setItem(ZYLALABS_API_KEY, apiKey);
    console.log('API ключ успешно сохранен в localStorage');
    return true;
  } catch (e) {
    console.error('Ошибка при установке API ключа:', e);
    return false;
  }
};
