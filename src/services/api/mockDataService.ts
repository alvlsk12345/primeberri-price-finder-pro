
import { generateMockSearchResults } from './mock/mockSearchGenerator';
import { useDemoModeForced } from './mock/mockServiceConfig';

/**
 * Функция для получения демо-результатов поиска
 */
export const getMockSearchResults = (query: string, page: number = 1) => {
  return generateMockSearchResults(query, page);
};

/**
 * Экспортируем флаг для принудительного использования демо-режима
 */
export { useDemoModeForced };
