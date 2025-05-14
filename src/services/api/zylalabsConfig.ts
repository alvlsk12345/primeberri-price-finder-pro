
// Этот файл оставлен для обратной совместимости
// Он реэкспортирует все функции из новых модулей

import { getApiKey, ZYLALABS_API_KEY, setApiKey as setZylalabsApiKey, resetApiKey } from './zylalabs/config';

// Безопасная функция построения URL для Zylalabs
export const buildZylalabsUrl = (query: string): string => {
  try {
    // Базовый URL из конфига
    const baseUrl = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";
    // Кодируем параметры запроса
    const encodedQuery = encodeURIComponent(query);
    // Строим URL
    return `${baseUrl}?query=${encodedQuery}`;
  } catch (e) {
    console.error('[ZylalabsConfig] Ошибка при построении URL:', e);
    return '';
  }
};

// Безопасная функция для выполнения API запроса к Zylalabs
export const makeZylalabsApiRequest = async (url: string): Promise<any> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API ключ Zylalabs не найден');
    }
    
    // Формируем заголовки запроса
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    // Выполняем запрос
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API запрос вернул ошибку: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (e) {
    console.error('[ZylalabsConfig] Ошибка при выполнении API запроса:', e);
    throw e;
  }
};

// Реэкспорт функций для обратной совместимости
export { getApiKey, ZYLALABS_API_KEY, setZylalabsApiKey as setApiKey, resetApiKey };
