
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
export const generateMockEuProducts = async (query: string, count: number = 36): Promise<Product[]> => {
  try {
    // Получаем базовые товары
    const baseProducts = getBaseProducts();
    
    // Создаем специфичный для запроса товар
    const queryRelatedProduct = createQueryRelatedProduct(query);
    
    // Обогащаем названия товаров поисковым запросом
    const enrichedProducts = enrichProductTitlesWithQuery(baseProducts, query);
    
    // Добавляем прямые ссылки на магазины (имитация direct_shop_results=true)
    const directStoreProducts = enrichedProducts.map(product => {
      const storeMap: {[key: string]: string} = {
        'Demo Store': 'amazon.de',
        'Test Shop': 'otto.de',
        'Example': 'mediamarkt.de',
        'Sample': 'zalando.de',
      };
      
      // Выбираем случайный магазин из списка
      const stores = Object.values(storeMap);
      const randomStore = stores[Math.floor(Math.random() * stores.length)];
      
      return {
        ...product,
        source: randomStore,
        // Создаем URL с правильным доменом магазина
        url: `https://${randomStore}/product/${encodeURIComponent(product.title.toLowerCase().replace(/\s+/g, '-'))}`
      };
    });
    
    // Объединяем все товары и ограничиваем по количеству
    const allProducts = [queryRelatedProduct, ...directStoreProducts];
    return allProducts.slice(0, count);
  } catch (error) {
    console.error('Ошибка при генерации демо-товаров для Европы:', error);
    return [];
  }
};
