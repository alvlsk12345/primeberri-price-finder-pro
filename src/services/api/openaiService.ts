
// Делаем реэкспорт всего из нового модуля openai
export * from './openai';

// Добавляем явный экспорт для brandSuggestions, чтобы избежать ошибок импорта
export { fetchBrandSuggestions } from './openai/brandSuggestion';
