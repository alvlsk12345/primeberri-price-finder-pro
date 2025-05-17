
// Кеш успешных ответов API (улучшенный)
const apiResponseCache: Record<string, {timestamp: number, data: any}> = {};
const CACHE_TTL = 7200000; // TTL кеша - 2 часа

/**
 * Получение кешированного ответа API по URL
 * @param url URL запроса
 * @param forceNewSearch Игнорировать кеш и выполнить новый запрос
 * @returns Кешированные данные или null, если кеш не найден, устарел или запрошен новый поиск
 */
export const getCachedResponse = (url: string, forceNewSearch: boolean = false) => {
  // Если запрошен принудительный поиск, не используем кеш
  if (forceNewSearch) {
    console.log('Принудительный поиск активирован, игнорируем кеш для URL:', url);
    return null;
  }
  
  const cachedItem = apiResponseCache[url];
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
    console.log('Используем кешированные данные для URL:', url);
    return cachedItem.data;
  }
  
  if (cachedItem) {
    console.log('Найден устаревший кеш для URL:', url, 'Возраст кеша (мс):', Date.now() - cachedItem.timestamp);
  } else {
    console.log('Кеш не найден для URL:', url);
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

/**
 * Очистка всего API кеша
 * @returns Количество удаленных элементов кеша
 */
export const clearApiCache = (): number => {
  const cacheSize = Object.keys(apiResponseCache).length;
  
  // Очищаем кеш
  for (const key in apiResponseCache) {
    delete apiResponseCache[key];
  }
  
  console.log(`Кеш API очищен, удалено ${cacheSize} элементов`);
  return cacheSize;
};

/**
 * Очистка элементов кеша, содержащих заданную строку в ключе
 * @param keyPattern Строка для поиска в ключах кеша
 * @returns Количество удаленных элементов кеша
 */
export const clearApiCacheByKeyPattern = (keyPattern: string): number => {
  let deletedCount = 0;
  
  for (const key in apiResponseCache) {
    if (key.includes(keyPattern)) {
      delete apiResponseCache[key];
      deletedCount++;
    }
  }
  
  console.log(`Очищено ${deletedCount} элементов кеша, содержащих "${keyPattern}"`);
  return deletedCount;
};
