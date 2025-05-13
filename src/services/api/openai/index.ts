
// Реэкспортируем все функции и типы из подмодулей
export * from './apiClient';
export * from './brandSuggestion';
export * from './config';
export * from './proxyUtils';
export * from './responseUtils';
export * from './searchService';

// Добавляем отсутствующие функции
export const getOpenAISearchResults = async (query: string, options?: any) => {
  try {
    const { fetchFromOpenAI } = await import('./searchService');
    return fetchFromOpenAI(query, options);
  } catch (error) {
    console.error('Ошибка при получении результатов поиска OpenAI:', error);
    throw error;
  }
};

// Для совместимости добавляем функции getApiProxy и setApiProxy
export const getApiProxy = (): string => {
  try {
    const { getProxyUrl } = require('./proxyUtils');
    return getProxyUrl();
  } catch (e) {
    return '';
  }
};

export const setApiProxy = (url: string): void => {
  try {
    const { setProxyUrl } = require('./proxyUtils');
    setProxyUrl(url);
  } catch (e) {
    console.error('Не удалось установить прокси URL:', e);
  }
};
