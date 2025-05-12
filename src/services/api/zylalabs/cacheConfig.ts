
/**
 * Конфигурация кэша API Zylalabs
 */

// Ключ для хранения кэша в localStorage
export const LOCAL_STORAGE_CACHE_KEY = 'zylalabs_api_cache';

// Время жизни кэша - 2 часа (в миллисекундах)
export const CACHE_TTL = 7200000; 

// Максимальное количество элементов в кэше
export const MAX_CACHE_SIZE = 100;

// Максимальный возраст кэша - 1 день (в миллисекундах)
export const MAX_CACHE_AGE = 86400000;

// Интервал автоматической очистки кэша (10 минут)
export const CLEANUP_INTERVAL = 600000;

/**
 * Тип для элемента кэша
 */
export interface CacheItem<T> {
  timestamp: number;
  data: T;
}

/**
 * Тип для хранилища кэша
 */
export type CacheStorage = Record<string, CacheItem<any>>;

