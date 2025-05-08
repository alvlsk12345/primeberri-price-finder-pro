import { Product, ProductFilters } from '../types';
import { toast } from "@/components/ui/sonner";
import { formatSingleProduct } from './singleProductFormatter';

// Функция для обработки данных о товарах из Zylalabs API
export const processZylalabsProductsData = async (products: any[], filters?: ProductFilters): Promise<Product[]> => {
  if (!Array.isArray(products) || products.length === 0) {
    console.log('Пустой массив продуктов или некорректный формат');
    toast.info('По вашему запросу ничего не найдено');
    return [];
  }
  
  console.log(`Обработка ${products.length} продуктов с фильтрами:`, filters);
  let invalidImageCounter = 0;

  // Обрабатываем товары с помощью функции форматирования
  const productPromises = products.map((product: any, index: number) => 
    formatSingleProduct(product, index, invalidImageCounter)
  );
  
  // Ждем завершения всех промисов
  const processedProductsRaw = await Promise.all(productPromises);
  const processedProducts = processedProductsRaw.filter(product => product !== null) as Product[];
  
  console.log(`Подготовлено товаров: ${processedProducts.length} из ${products.length}`);
  console.log(`Товаров без изображений: ${invalidImageCounter}`);
  
  // Применяем фильтры к обработанным товарам
  const filteredProducts = applyProductFilters(processedProducts, filters);
  
  // Уведомляем о количестве найденных товаров
  if (filteredProducts.length === 0) {
    toast.info('По вашему запросу ничего не найдено');
  } else {
    toast.success(`Найдено ${filteredProducts.length} товаров`);
  }
  
  return filteredProducts;
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
