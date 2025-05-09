
import { Product, ProductFilters } from '../types';
import { formatSingleProduct } from './singleProductFormatter';

/**
 * Функция для обработки данных о товарах, полученных от API Zylalabs
 */
export const processZylalabsProductsData = async (
  products: any[],
  filters?: ProductFilters
): Promise<Product[]> => {
  try {
    console.log(`Обработка ${products.length} продуктов с фильтрами:`, filters);
    
    // Форматируем каждый товар
    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Преобразуем товар в нужный формат
          return await formatSingleProduct(product);
        } catch (error) {
          console.error('Ошибка при форматировании товара:', error);
          return null;
        }
      })
    );
    
    // Фильтруем null-значения (ошибки форматирования)
    const validProducts = formattedProducts.filter(Boolean) as Product[];
    console.log(`Подготовлено товаров: ${validProducts.length} из ${products.length}`);
    
    // Подсчитываем количество товаров без изображений
    const productsWithoutImages = validProducts.filter(p => !p.image).length;
    console.log(`Товаров без изображений: ${productsWithoutImages}`);
    
    // Применяем фильтры, если они указаны
    let filteredProducts = validProducts;
    if (filters) {
      filteredProducts = applyFilters(validProducts, filters);
      console.log(`После применения фильтров осталось товаров: ${filteredProducts.length}`);
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Ошибка при обработке данных о товарах:', error);
    return [];
  }
};

/**
 * Применяет фильтры к списку товаров
 */
const applyFilters = (products: Product[], filters: ProductFilters): Product[] => {
  return products.filter((product) => {
    // Фильтр по цене
    if (filters.minPrice && product._numericPrice && product._numericPrice < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product._numericPrice && product._numericPrice > filters.maxPrice) {
      return false;
    }
    
    // Фильтр по бренду
    if (filters.brands && filters.brands.length > 0 && product.brand) {
      if (!filters.brands.some(brand => 
        product.brand?.toLowerCase().includes(brand.toLowerCase())
      )) {
        return false;
      }
    }
    
    // Фильтр по источнику
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.some(source => 
        product.source.toLowerCase().includes(source.toLowerCase())
      )) {
        return false;
      }
    }
    
    // Фильтр по рейтингу
    if (filters.rating && product.rating < filters.rating) {
      return false;
    }
    
    return true;
  });
};
