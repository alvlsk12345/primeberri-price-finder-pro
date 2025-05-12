
// Ключ для хранения API ключа Perplexity в localStorage
export const PERPLEXITY_API_KEY_STORAGE = 'perplexity_api_key';

// Функция для получения API ключа
export const getApiKey = (): string => {
  return localStorage.getItem(PERPLEXITY_API_KEY_STORAGE) || '';
};

// Функция для проверки наличия валидного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== null && key !== undefined && key.trim() !== '';
};

// Функция для установки API ключа
export const setApiKey = (apiKey: string): void => {
  if (apiKey && apiKey.trim()) {
    localStorage.setItem(PERPLEXITY_API_KEY_STORAGE, apiKey.trim());
  }
};
