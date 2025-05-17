
import { Product, ProductFilters, SortOption } from '../types';
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
      
      // Сортируем продукты, если указана опция сортировки
      if (filters.sortBy) {
        filteredProducts = sortProducts(filteredProducts, filters.sortBy as SortOption);
        console.log(`Товары отсортированы по: ${filters.sortBy}`);
      }
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Ошибка при обработке данных о товарах:', error);
    return [];
  }
};

/**
 * Сортирует товары по заданному критерию
 */
const sortProducts = (products: Product[], sortBy: SortOption): Product[] => {
  const sortedProducts = [...products]; // Создаём копию, чтобы не менять исходный массив
  
  switch (sortBy) {
    case "price_asc":
    case "price-asc": 
      return sortedProducts.sort((a, b) => {
        const priceA = a._numericPrice !== undefined ? a._numericPrice : 0;
        const priceB = b._numericPrice !== undefined ? b._numericPrice : 0;
        return priceA - priceB;
      });
      
    case "price_desc":
    case "price-desc": 
      return sortedProducts.sort((a, b) => {
        const priceA = a._numericPrice !== undefined ? a._numericPrice : 0;
        const priceB = b._numericPrice !== undefined ? b._numericPrice : 0;
        return priceB - priceA;
      });
      
    case "rating_desc":
    case "rating-desc": 
      return sortedProducts.sort((a, b) => {
        const ratingA = a.rating !== undefined ? a.rating : 0;
        const ratingB = b.rating !== undefined ? b.rating : 0;
        return ratingB - ratingA;
      });
      
    default:
      return sortedProducts;
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
    
    // Фильтр по стране
    if (filters.countries && filters.countries.length > 0 && product.country) {
      if (!filters.countries.includes(product.country)) {
        return false;
      }
    }
    
    return true;
  });
};
