
/**
 * Google Search API - индексный файл
 * Экспортирует все функции для использования в приложении
 */

// Экспорт конфигурации
export * from './config';

// Экспорт функций валидации и тестирования
export {
  validateGoogleApiConfig,
  validateGoogleApiKey,
  // Явный экспорт функции testMinimalGoogleApiRequest из validator.ts,
  // чтобы избежать конфликта с одноименной функцией из imageSearch.ts
  testMinimalGoogleApiRequest
} from './validator';

// Экспорт функций поиска изображений
export * from './imageSearch';
