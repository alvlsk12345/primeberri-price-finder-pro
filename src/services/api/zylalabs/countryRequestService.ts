
import { getApiKey } from "./config";
import { getCachedResponse, setCacheResponse } from "./cacheService";

/**
 * Выполняет запрос к API Zylalabs для конкретной страны, как в HTML-примере
 * @param query Поисковый запрос
 * @param countryCode Код страны
 * @param page Номер страницы
 * @param language Код языка (добавлен параметр)
 * @param signal Объект AbortSignal для отмены запросов (опционально)
 * @returns Результаты поиска или null в случае ошибки
 */
export const makeZylalabsCountryRequest = async (
  query: string, 
  countryCode: string, 
  page: number = 1,
  language: string = 'ru', // По умолчанию используем русский язык
  signal?: AbortSignal // Добавляем опциональный параметр signal
): Promise<any> => {
  const apiKey = getApiKey();
  
  // Проверка наличия ключа API
  if (!apiKey) {
    console.error('Отсутствует API ключ');
    return null;
  }
  
  // Формирование URL запроса точно как в HTML-примере, но с добавлением языка
  const params = new URLSearchParams({
    q: query,
    country: countryCode,
    page: page.toString(),
    language: language // Добавляем параметр языка
  });
  
  const apiBaseUrl = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";
  const url = `${apiBaseUrl}?${params.toString()}`;
  
  // Проверяем кэш для данного URL
  const cachedResponse = getCachedResponse(url);
  if (cachedResponse) {
    console.log(`Используем кэшированные данные для страны ${countryCode}`);
    return cachedResponse;
  }
  
  console.log(`Запрос товаров для страны ${countryCode} на языке ${language}:`, url);
  
  try {
    // Устанавливаем таймаут в 10 секунд для каждого запроса по стране (было 15)
    const controller = new AbortController();
    
    // Объединяем внешний signal с нашим локальным, если внешний передан
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }
    
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд для запросов по отдельным странам
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    // Очищаем таймаут
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Ошибка API для страны ${countryCode}:`, response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Кэшируем результат
    setCacheResponse(url, data);
    
    return data;
  } catch (error: any) {
    console.warn(`Ошибка при запросе товаров для страны ${countryCode}:`, error.message);
    return null;
  }
};
