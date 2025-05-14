
// Делаем реэкспорт всего из нового модуля openai
export * from './openai';
// Импортируем и экспортируем необходимые функции из конкретных модулей
export { callOpenAI } from './openai/apiClient';
export { fetchBrandSuggestions } from './openai/brandSuggestion';
