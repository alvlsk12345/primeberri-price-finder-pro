
/**
 * Конфигурация для Google Custom Search API
 */

// API ключ для Google Custom Search API
export const GOOGLE_API_KEY = 'AIzaSyAZxgGY2FDeok5lNlCIIulQda0BBKEK2ZU';

// ID поисковой системы
export const GOOGLE_SEARCH_ENGINE_ID = 'e52af8ec5dbe646c8';

// Параметры запросов
export const API_CONFIG = {
  BASE_URL: 'https://www.googleapis.com/customsearch/v1',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 2000,
};

// Кэш для хранения результатов поиска изображений
export const imageCache: Record<string, string> = {};
