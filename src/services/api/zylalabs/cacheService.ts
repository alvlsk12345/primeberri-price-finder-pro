
// Кеш успешных ответов API (улучшенный)
const apiResponseCache: Record<string, {timestamp: number, data: any}> = {};
const CACHE_TTL = 7200000; // TTL кеша - 2 часа (увеличено с 30 минут)

// Локальное хранилище для персистентного кэша между сессиями
const LOCAL_STORAGE_CACHE_KEY = 'zylalabs_api_cache';
const MAX_CACHE_SIZE = 100; // Максимальное количество элементов в кэше
const MAX_CACHE_AGE = 86400000; // Один день в миллисекундах

/**
 * Инициализация кэша из localStorage при запуске
 */
const initCacheFromStorage = () => {
  try {
    const storedCache = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (storedCache) {
      const parsedCache = JSON.parse(storedCache);
      
      // Проверяем и фильтруем устаревшие записи
      const now = Date.now();
      const filteredEntries = Object.entries(parsedCache)
        .filter(([_, value]: [string, any]) => now - value.timestamp < MAX_CACHE_AGE);
      
      if (filteredEntries.length > 0) {
        // Обновляем кэш только валидными записями
        Object.assign(apiResponseCache, Object.fromEntries(filteredEntries));
        console.log(`Загружено ${filteredEntries.length} кэшированных API ответов из localStorage`);
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке кэша из localStorage:', error);
    // В случае ошибки очищаем хранилище
    localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
  }
};

// Выполняем инициализацию кэша при загрузке модуля
initCacheFromStorage();

/**
 * Сохранение кэша в localStorage
 */
const saveCacheToStorage = () => {
  try {
    // Фильтруем только свежие записи
    const now = Date.now();
    const freshEntries = Object.entries(apiResponseCache)
      .filter(([_, value]: [string, any]) => now - value.timestamp < MAX_CACHE_AGE);
    
    if (freshEntries.length > 0) {
      const cacheToSave = Object.fromEntries(freshEntries);
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cacheToSave));
      console.log(`Сохранено ${freshEntries.length} API ответов в localStorage`);
    }
  } catch (error) {
    console.error('Ошибка при сохранении кэша в localStorage:', error);
  }
};

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
  // Ограничиваем размер кеша (увеличен до 100 запросов)
  const cacheKeys = Object.keys(apiResponseCache);
  if (cacheKeys.length >= MAX_CACHE_SIZE) {
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
  console.log('Данные сохранены в кэш для URL:', url);
  
  // Сохраняем обновленный кэш в localStorage (но не при каждом обновлении)
  // Используем вероятность 20%, чтобы не вызывать сохранение слишком часто
  if (Math.random() < 0.2) {
    saveCacheToStorage();
  }
};

/**
 * Очистка устаревших элементов кэша
 */
export const cleanExpiredCache = () => {
  const now = Date.now();
  let removedCount = 0;
  
  Object.keys(apiResponseCache).forEach(key => {
    if (now - apiResponseCache[key].timestamp > CACHE_TTL) {
      delete apiResponseCache[key];
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`Очищено ${removedCount} устаревших элементов кэша`);
    // Сохраняем обновленный кэш после очистки
    saveCacheToStorage();
  }
  
  return removedCount;
};

// Запускаем периодическую очистку кэша (каждые 10 минут)
setInterval(cleanExpiredCache, 600000);

// Сохраняем кэш при закрытии страницы
window.addEventListener('beforeunload', () => {
  saveCacheToStorage();
});
