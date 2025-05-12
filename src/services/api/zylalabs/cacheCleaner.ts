
import { CACHE_TTL, CLEANUP_INTERVAL, CacheStorage } from './cacheConfig';
import { saveCacheToStorage } from './storageService';

/**
 * Очистка устаревших элементов кэша
 * @param apiResponseCache Текущий кэш API
 * @returns Количество удаленных элементов
 */
export const cleanExpiredCache = (apiResponseCache: CacheStorage): number => {
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
    saveCacheToStorage(apiResponseCache);
  }
  
  return removedCount;
};

/**
 * Запуск автоматической очистки кэша с указанным интервалом
 * @param apiResponseCache Ссылка на объект кэша API
 * @returns ID интервала для возможной остановки
 */
export const startAutoCleaning = (apiResponseCache: CacheStorage): number => {
  return window.setInterval(() => {
    cleanExpiredCache(apiResponseCache);
  }, CLEANUP_INTERVAL);
};

