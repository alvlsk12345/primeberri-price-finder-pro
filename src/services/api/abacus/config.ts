
// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  return localStorage.getItem('abacus_api_key') || '';
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  localStorage.setItem('abacus_api_key', key);
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key.length > 10; // Предполагаем, что действительный ключ API Abacus должен быть достаточно длинным
};

// Базовый URL API Abacus
export const BASE_URL = "https://api.abacus.ai/api/v0";

// Таймаут для запросов к API (в миллисекундах)
export const REQUEST_TIMEOUT = 30000; // 30 секунд
