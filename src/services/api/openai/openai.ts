
// Модуль OpenAI для реэкспорта всех необходимых функций

import { brandSuggestion } from './brandSuggestion';
import { getApiKey, setApiKey } from './config';
import { searchService } from './searchService';
import * as apiClient from './apiClient';
import * as proxyUtils from './proxyUtils';
import * as responseUtils from './responseUtils';

// Реэкспортируем все необходимые компоненты
export {
  // Основные функциональные модули
  brandSuggestion,
  searchService,
  
  // Конфигурация
  getApiKey,
  setApiKey,
  
  // Утилиты и клиенты
  apiClient,
  proxyUtils,
  responseUtils
};
