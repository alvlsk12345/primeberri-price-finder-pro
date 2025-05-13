
// Реэкспортируем все необходимые функции и типы из модулей openai
import * as OpenAIModule from './openai';

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
