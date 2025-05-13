
// Делаем прямой реэкспорт из суб-модуля openai
import * as OpenAIModule from './openai/index';

// Экспортируем все функции напрямую
export const {
  callOpenAI,
  getOpenAISearchResults,
  fetchBrandSuggestions,
  getApiKey,
  setApiKey,
  getApiProxy,
  setApiProxy
} = OpenAIModule;
