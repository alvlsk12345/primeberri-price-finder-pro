
import { CACHE_TTL, MAX_CACHE_SIZE, CacheStorage } from './cacheConfig';
import { loadCacheFromStorage, saveCacheToStorage } from './storageService';
import { startAutoCleaning } from './cacheCleaner';

// Кэш успешных ответов API
const apiResponseCache: CacheStorage = loadCacheFromStorage();

// Запускаем периодическую очистку кэша
const cleanupIntervalId = startAutoCleaning(apiResponseCache);

// Сохраняем кэш при закрытии страницы
window.addEventListener('beforeunload', () => {
  saveCacheToStorage(apiResponseCache);
});

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
  // Ограничиваем размер кеша
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
    saveCacheToStorage(apiResponseCache);
  }
};

/**
 * Явное принудительное сохранение кэша в localStorage
 */
export const forceSaveCacheToStorage = () => {
  saveCacheToStorage(apiResponseCache);
};

/**
 * Очистка кэша по конкретному URL
 * @param url URL для удаления из кэша
 * @returns true если элемент был найден и удален, иначе false
 */
export const invalidateCache = (url: string): boolean => {
  if (apiResponseCache[url]) {
    delete apiResponseCache[url];
    console.log('Удален элемент кэша для URL:', url);
    return true;
  }
  return false;
};

/**
 * Очистка всего кэша
 */
export const clearAllCache = (): void => {
  Object.keys(apiResponseCache).forEach(key => {
    delete apiResponseCache[key];
  });
  localStorage.removeItem('zylalabs_api_cache');
  console.log('Весь кэш очищен');
};
