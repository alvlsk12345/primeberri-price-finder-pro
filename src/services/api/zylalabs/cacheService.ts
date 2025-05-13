
// Кеш успешных ответов API (улучшенный)
const apiResponseCache: Record<string, {timestamp: number, data: any}> = {};
const CACHE_TTL = 7200000; // TTL кеша - 2 часа

/**
 * Получение кешированного ответа API по URL
 * @param url URL запроса
 * @returns Кешированные данные или null, если кеш не найден или устарел
 */
export const getCachedResponse = (url: string) => {
  const cachedItem = apiResponseCache[url];
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
    console.log('Используем кешированные данные для URL:', url);
    return cachedItem.data;
  }
  return null;
};

/**
 * Сохранение ответа API в кеш
 * @param url URL запроса
 * @param data Данные для кеширования
 */
export const setCacheResponse = (url: string, data: any) => {
  // Ограничиваем размер кеша (максимум 50 запросов)
  const cacheKeys = Object.keys(apiResponseCache);
  if (cacheKeys.length >= 50) {
    // Удаляем самый старый элемент кеша
    let oldestKey = cacheKeys[0];
    let oldestTime = apiResponseCache[oldestKey].timestamp;
    
    cacheKeys.forEach(key => {
      if (apiResponseCache[key].timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = apiResponseCache[key].timestamp;
      }
    });
    
    console.log('Кеш переполнен, удаляем самый старый элемент:', oldestKey);
    delete apiResponseCache[oldestKey];
  }
  
  apiResponseCache[url] = {
    timestamp: Date.now(),
    data
  };
  console.log('Данные сохранены в кеш для URL:', url);
};
