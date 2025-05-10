
import { Product, ProductFilters } from './types';
import { processZylalabsProductsData } from './formatters/productDataFormatter';
import { extractNumericPrice, formatSingleProduct } from './formatters/singleProductFormatter';
import { processProductImage } from './imageProcessor';

// Экспортируем функции и типы
export { 
  processZylalabsProductsData, 
  extractNumericPrice, 
  formatSingleProduct, 
  processProductImage 
};

export type { Product, ProductFilters };
