
// Константа для названия ключа в localStorage
const ABACUS_API_KEY_STORAGE = 'abacus_api_key';

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  return localStorage.getItem(ABACUS_API_KEY_STORAGE) || '';
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  localStorage.setItem(ABACUS_API_KEY_STORAGE, key);
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key.length > 10;
};

// Базовый URL API Abacus.ai
export const API_BASE_URL = 'https://api.abacus.ai/api/v0';
