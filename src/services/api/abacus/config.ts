
// Константа для названия ключа в localStorage
const ABACUS_API_KEY_STORAGE = 'abacus_api_key';

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    // Проверяем доступность localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[AbacusConfig] localStorage недоступен');
      return '';
    }
    
    const key = localStorage.getItem(ABACUS_API_KEY_STORAGE);
    return key || '';
  } catch (e) {
    console.error('[AbacusConfig] Ошибка при получении API ключа:', e);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    // Проверяем доступность localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[AbacusConfig] localStorage недоступен, ключ не будет сохранен');
      return;
    }
    
    localStorage.setItem(ABACUS_API_KEY_STORAGE, key);
  } catch (e) {
    console.error('[AbacusConfig] Ошибка при сохранении API ключа:', e);
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  try {
    const key = getApiKey();
    return key !== '' && key.length > 10;
  } catch (e) {
    console.error('[AbacusConfig] Ошибка при проверке API ключа:', e);
    return false;
  }
};

// Базовый URL API Abacus.ai
export const API_BASE_URL = 'https://api.abacus.ai/api/v0';
