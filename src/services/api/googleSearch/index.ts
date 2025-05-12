
/**
 * Google Search API - индексный файл
 * Экспортирует все функции для использования в приложении
 */

// Экспорт конфигурации
export * from './config';

// Экспорт функций валидации и тестирования
export {
  validateGoogleApiKey,
  // Переименовываем функцию для экспорта, чтобы избежать конфликта
  testMinimalGoogleApiRequest as testGoogleApiConnection
} from './validator';

// Явный экспорт необходимой функции из validator
// для использования в imageSearch.ts
export { testMinimalGoogleApiRequest } from './validator';

// Экспорт функций поиска изображений
export * from './imageSearch';
