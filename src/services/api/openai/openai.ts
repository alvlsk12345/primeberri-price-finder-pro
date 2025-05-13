
// Модуль OpenAI для реэкспорта всех необходимых функций

import { fetchBrandSuggestions } from './brandSuggestion';
import { getApiKey, setApiKey } from './config';
import { fetchFromOpenAI } from './searchService';
import * as apiClient from './apiClient';
import * as proxyUtils from './proxyUtils';
import * as responseUtils from './responseUtils';

// Реэкспортируем все необходимые компоненты
export {
  // Основные функциональные модули
  fetchBrandSuggestions,
  fetchFromOpenAI as searchService,
  
  // Конфигурация
  getApiKey,
  setApiKey,
  
  // Утилиты и клиенты
  apiClient,
  proxyUtils,
  responseUtils
};
