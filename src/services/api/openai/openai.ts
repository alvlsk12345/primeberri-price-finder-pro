
// Экспортируем всё из подмодулей
export * from './config';
export * from './apiClient';
export * from './proxyUtils';
export * from './responseUtils';

// Экспортируем brandSuggestion
export { fetchBrandSuggestions } from './brandSuggestion';

// Экспортируем основной метод для вызова OpenAI API
export { callOpenAI } from './apiClient';

// Экспортируем сервис поиска
export { searchWithOpenAI } from './searchService';
