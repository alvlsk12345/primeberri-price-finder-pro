
import { getApiKey, BASE_URL, REQUEST_TIMEOUT } from "./config";
import { SearchParams } from "../../types";
import { buildUrl } from "./urlBuilder";
import { getCachedResponse, setCacheResponse } from "./cacheService";

/**
 * Выполняет запрос к API Zylalabs с обработкой ошибок и кешированием
 * @param params Параметры запроса
 * @param forceNewSearch Принудительно выполнить новый запрос (игнорировать кеш)
 * @returns Результат запроса или null в случае ошибки
 */
export const makeZylalabsApiRequest = async (params: SearchParams, forceNewSearch: boolean = false): Promise<any> => {
  try {
    // Получаем API ключ
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      console.error('API ключ отсутствует. Пожалуйста, добавьте API ключ в настройках.');
      return null;
    }
    
    // Формируем URL запроса на основе параметров
    const url = buildUrl(params);
    console.log('Запрос к API:', url);
    
    // Проверяем наличие данных в кеше (если не запрошен принудительный поиск)
    if (!forceNewSearch) {
      const cachedData = getCachedResponse(url);
      if (cachedData) {
        return cachedData;
      }
    } else {
      console.log('Выполняем принудительный новый запрос, кеш игнорируется');
    }
    
    // Выполняем запрос с таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Проверяем статус ответа
      if (!response.ok) {
        const error = await response.text();
        console.error(`Ошибка API (${response.status}):`, error);
        return null;
      }
      
      // Парсим ответ
      const data = await response.json();
      
      // Сохраняем успешный ответ в кеш
      setCacheResponse(url, data);
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Запрос превысил таймаут:', REQUEST_TIMEOUT, 'мс');
      } else {
        console.error('Ошибка при выполнении запроса:', error);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Критическая ошибка при выполнении запроса:', error);
    return null;
  }
};
