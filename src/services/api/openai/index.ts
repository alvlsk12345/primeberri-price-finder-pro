
// Экспортируем все необходимые функции из подмодулей
export { getApiKey, setApiKey, hasValidApiKey } from './config';
export { callOpenAI } from './apiClient';
export { fetchFromOpenAI } from './searchService';
export { fetchBrandSuggestions } from './brandSuggestion';
export { createMockProductsFromQuery } from './responseUtils';
