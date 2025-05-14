
// Константа для названия ключа в localStorage
const ABACUS_API_KEY_STORAGE = 'abacus_api_key';

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    return localStorage.getItem(ABACUS_API_KEY_STORAGE) || '';
  } catch (error) {
    console.error('Ошибка при получении API ключа Abacus:', error);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    localStorage.setItem(ABACUS_API_KEY_STORAGE, key);
    console.log('API ключ Abacus успешно сохранен');
  } catch (error) {
    console.error('Ошибка при сохранении API ключа Abacus:', error);
  }
};

// Функция для сброса API ключа Abacus
export const resetApiKey = (): boolean => {
  try {
    console.log('Выполняется сброс API ключа Abacus...');
    localStorage.removeItem(ABACUS_API_KEY_STORAGE);
    console.log('API ключ Abacus успешно удален');
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе API ключа Abacus:', error);
    return false;
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key.length > 10;
};

// Базовый URL API Abacus.ai
export const API_BASE_URL = 'https://api.abacus.ai/api/v0';
