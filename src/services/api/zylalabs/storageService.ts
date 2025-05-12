
import { CacheStorage, LOCAL_STORAGE_CACHE_KEY, MAX_CACHE_AGE } from './cacheConfig';

/**
 * Загрузка кэша из localStorage
 * @returns Объект с кэшем из localStorage или пустой объект
 */
export const loadCacheFromStorage = (): CacheStorage => {
  try {
    const storedCache = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!storedCache) {
      return {};
    }
    
    const parsedCache = JSON.parse(storedCache);
    
    // Проверяем и фильтруем устаревшие записи
    const now = Date.now();
    const filteredEntries = Object.entries(parsedCache)
      .filter(([_, value]: [string, any]) => now - value.timestamp < MAX_CACHE_AGE);
    
    if (filteredEntries.length > 0) {
      // Возвращаем только валидные записи
      const validCache = Object.fromEntries(filteredEntries);
      console.log(`Загружено ${filteredEntries.length} кэшированных API ответов из localStorage`);
      return validCache as CacheStorage;
    }
    
    return {} as CacheStorage;
  } catch (error) {
    console.error('Ошибка при загрузке кэша из localStorage:', error);
    // В случае ошибки очищаем хранилище
    localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
    return {} as CacheStorage;
  }
};

/**
 * Сохранение кэша в localStorage
 * @param cache Объект с кэшем
 */
export const saveCacheToStorage = (cache: CacheStorage): void => {
  try {
    // Фильтруем только свежие записи
    const now = Date.now();
    const freshEntries = Object.entries(cache)
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
