
// Делаем реэкспорт всего из нового модуля openai
export * from './config';
export * from './apiClient';
export * from './responseUtils';
export * from './searchService';
export * from './proxyUtils';

// Импортируем модули отдельно, чтобы избежать конфликтов имен
// Убираем прямой экспорт из ./brandSuggestion, т.к. он конфликтует с ./brandSuggestion/index
export * from './brandSuggestion/index';

// Для совместимости также экспортируем оригинальную функцию fetchBrandSuggestions
// если она используется где-то напрямую из данного модуля
export { fetchBrandSuggestions } from './brandSuggestion';
