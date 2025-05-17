
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

// Импортируем необходимые функции для создания демо-товаров
import { getBaseProducts } from './baseProducts';
import { createQueryRelatedProduct, enrichProductTitlesWithQuery } from './dynamicProductGenerator';
import { Product } from '../../types';

/**
 * Генерирует демо-товары для европейского поиска
 * @param query Строка поискового запроса
 * @param count Количество товаров, которое нужно сгенерировать
 * @returns Массив демо-товаров
 */
export const generateMockEuProducts = async (query: string, count: number = 10): Promise<Product[]> => {
  try {
    // Получаем базовые товары
    const baseProducts = getBaseProducts();
    
    // Создаем специфичный для запроса товар
    const queryRelatedProduct = createQueryRelatedProduct(query);
    
    // Обогащаем названия товаров поисковым запросом
    const enrichedProducts = enrichProductTitlesWithQuery(baseProducts, query);
    
    // Объединяем все товары
    const allProducts = [queryRelatedProduct, ...enrichedProducts];
    
    // Ограничиваем количество товаров
    return allProducts.slice(0, count);
  } catch (error) {
    console.error('Ошибка при генерации демо-товаров для Европы:', error);
    return [];
  }
};
