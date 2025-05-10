
import { Product, ProductFilters } from './types';
import { processZylalabsProductsData } from './formatters/productDataFormatter';
import { extractNumericPrice, formatSingleProduct } from './formatters/singleProductFormatter';
import { processProductImage, isZylalabsImage, isGoogleShoppingImage, isGoogleCseImage } from './imageProcessor';

// Экспортируем AI сервисы
export { fetchBrandSuggestions, searchProducts, getCurrentAIProvider, setCurrentAIProvider } from './api/aiService';
export type { AIProvider } from './api/aiService';

// Экспортируем функции и типы
export { 
  processZylalabsProductsData, 
  extractNumericPrice, 
  formatSingleProduct, 
  processProductImage,
  isZylalabsImage,
  isGoogleShoppingImage,
  isGoogleCseImage
};

export type { Product, ProductFilters };
