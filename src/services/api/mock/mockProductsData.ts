
/**
 * Этот файл является точкой входа для экспорта всех функций, связанных с генерацией демо-товаров.
 * Он реэкспортирует функции из других файлов для поддержания обратной совместимости.
 */

// Реэкспорт базовых товаров
export { getBaseProducts } from './baseProducts';

// Реэкспорт специальных товаров
export { getSpecificProducts } from './specializedProducts';

// Реэкспорт генераторов динамических товаров
export { 
  createQueryRelatedProduct, 
  createExtraProduct, 
  createPageSpecificProducts,
  enrichProductTitlesWithQuery
} from './dynamicProductGenerator';
