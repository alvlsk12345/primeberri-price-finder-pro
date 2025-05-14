
// Делаем реэкспорт всего из соответствующих модулей
import { generateBrandSuggestions } from './brandSuggestion';
import { searchProducts } from './searchService';
import { getApiKey, setApiKey } from './config';

// Экспортируем все необходимые функции
export {
  generateBrandSuggestions,
  searchProducts,
  getApiKey,
  setApiKey
};
