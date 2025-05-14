
// Константа для названия ключа в localStorage
const ABACUS_API_KEY_STORAGE = 'abacus_api_key';

// Вспомогательная функция для безопасной проверки доступности localStorage
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_abacus_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[AbacusConfig] localStorage недоступен:', e);
    return false;
  }
}

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    // Проверяем доступность localStorage перед любой операцией
    if (!isLocalStorageAvailable()) {
      console.warn('[AbacusConfig] localStorage недоступен, возвращаем пустую строку');
      return '';
    }
    
    try {
      const key = localStorage.getItem(ABACUS_API_KEY_STORAGE);
      return key || '';
    } catch (e) {
      console.error('[AbacusConfig] Ошибка при чтении API ключа из localStorage:', e);
      return '';
    }
  } catch (e) {
    console.error('[AbacusConfig] Непредвиденная ошибка при получении API ключа:', e);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    // Проверяем доступность localStorage перед любой операцией
    if (!isLocalStorageAvailable()) {
      console.warn('[AbacusConfig] localStorage недоступен, ключ не будет сохранен');
      return;
    }
    
    try {
      localStorage.setItem(ABACUS_API_KEY_STORAGE, key);
    } catch (e) {
      console.error('[AbacusConfig] Ошибка при сохранении API ключа в localStorage:', e);
    }
  } catch (e) {
    console.error('[AbacusConfig] Непредвиденная ошибка при сохранении API ключа:', e);
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
