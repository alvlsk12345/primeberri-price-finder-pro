
// Этот файл предоставляет основной API для работы с OpenAI

import { getApiKey, setApiKey, hasValidApiKey, resetApiKey } from './config';
import { callOpenAI } from './apiClient';
import { fetchFromOpenAI } from './searchService'; 
import { createMockProductsFromQuery } from './responseUtils';
import { fetchBrandSuggestions } from './brandSuggestion';

// Экспортируем все необходимые функции
export {
  getApiKey,
  setApiKey,
  hasValidApiKey,
  resetApiKey,
  callOpenAI,
  fetchFromOpenAI,
  fetchBrandSuggestions,
  createMockProductsFromQuery
};

