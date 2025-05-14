
// Константа для названия ключа в localStorage
const PERPLEXITY_API_KEY_STORAGE = 'perplexity_api_key';

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    return localStorage.getItem(PERPLEXITY_API_KEY_STORAGE) || '';
  } catch (error) {
    console.error('Ошибка при получении API ключа Perplexity:', error);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    localStorage.setItem(PERPLEXITY_API_KEY_STORAGE, key);
    console.log('API ключ Perplexity успешно сохранен');
  } catch (error) {
    console.error('Ошибка при сохранении API ключа Perplexity:', error);
  }
};

// Функция для сброса API ключа Perplexity
export const resetApiKey = (): boolean => {
  try {
    console.log('Выполняется сброс API ключа Perplexity...');
    localStorage.removeItem(PERPLEXITY_API_KEY_STORAGE);
    console.log('API ключ Perplexity успешно удален');
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе API ключа Perplexity:', error);
    return false;
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key.length > 10;
};

// Базовый URL API Perplexity
export const API_BASE_URL = 'https://api.perplexity.ai';
