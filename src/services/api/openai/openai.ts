
// Делаем реэкспорт всего из соответствующих модулей
import { fetchBrandSuggestions } from './brandSuggestion';
import { fetchFromOpenAI } from './searchService';
import { getApiKey, setApiKey } from './config';

// Экспортируем все необходимые функции
export {
  fetchBrandSuggestions as generateBrandSuggestions,
  fetchFromOpenAI as searchProducts,
  getApiKey,
  setApiKey
};
