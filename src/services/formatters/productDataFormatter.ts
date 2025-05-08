
import { Product, ProductFilters } from '../types';
import { toast } from "@/components/ui/sonner";
import { formatSingleProduct } from './singleProductFormatter';

// Функция для обработки данных о товарах из Zylalabs API
export const processZylalabsProductsData = async (products: any[], filters?: ProductFilters): Promise<Product[]> => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов с фильтрами:`, filters);
  let invalidImageCounter = 0;

  try {
    // Обрабатываем товары с помощью функции форматирования
    const productPromises = products.map(async (product: any, index: number) => {
      try {
        // Проверяем, является ли продукт уже готовым (мок-данные)
        if (product.id && product.id.startsWith('mock-')) {
          console.log('Обнаружен готовый продукт (мок):', product.title);
          return {
            ...product,
            _numericPrice: parseFloat(product.price) || 0
          };
        }
        
        return await formatSingleProduct(product, index, invalidImageCounter);
      } catch (err) {
        console.error('Ошибка при обработке товара:', err);
        return null;
      }
    });
    
    // Ждем завершения всех промисов
    const processedProductsRaw = await Promise.all(productPromises);
    const processedProducts = processedProductsRaw.filter(product => product !== null) as Product[];
    
    console.log(`Подготовлено товаров: ${processedProducts.length} из ${products.length}`);
    console.log(`Товаров без изображений: ${invalidImageCounter}`);
    
    // Применяем фильтры к обработанным товарам
    const filteredProducts = applyProductFilters(processedProducts, filters);
    
    return filteredProducts;
  } catch (error) {
    console.error('Ошибка при обработке данных товаров:', error);
    toast.error('Произошла ошибка при подготовке данных товаров');
    return [];
  }
};

// Функция для применения фильтров к обработанным товарам
const applyProductFilters = (products: Product[], filters?: ProductFilters): Product[] => {
  if (!filters) return products;
  
  const filteredProducts = products.filter((product: Product) => {
    // Фильтрация по цене
    if (filters.minPrice && product._numericPrice && product._numericPrice < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product._numericPrice && product._numericPrice > filters.maxPrice) {
      return false;
    }
    
    // Фильтрация по брендам
    if (filters.brands && filters.brands.length > 0 && product.brand && 
        !filters.brands.some(brand => product.brand?.toLowerCase().includes(brand.toLowerCase()))) {
      return false;
    }
    
    // Фильтрация по источникам
    if (filters.sources && filters.sources.length > 0 && 
        !filters.sources.some(source => product.source.toLowerCase().includes(source.toLowerCase()))) {
      return false;
    }
    
    // Фильтрация по рейтингу
    if (filters.rating && product.rating < filters.rating) {
      return false;
    }
    
    return true;
  });
  
  console.log(`После применения фильтров осталось товаров: ${filteredProducts.length}`);
  
  if (filteredProducts.length === 0 && products.length > 0) {
    toast.info('По заданным фильтрам товары не найдены');
  }
  
  return filteredProducts;
};
