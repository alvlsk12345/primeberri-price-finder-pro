
// Константа для названия ключа в localStorage
const ANTHROPIC_API_KEY_STORAGE = 'anthropic_api_key';

// Вспомогательная функция для безопасной проверки доступности localStorage
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_anthropic_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[AnthropicConfig] localStorage недоступен:', e);
    return false;
  }
}

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    // Проверяем доступность localStorage перед любой операцией
    if (!isLocalStorageAvailable()) {
      console.warn('[AnthropicConfig] localStorage недоступен, возвращаем пустую строку');
      return '';
    }
    
    try {
      const key = localStorage.getItem(ANTHROPIC_API_KEY_STORAGE);
      // Дополнительная проверка на null и невалидные значения
      if (key === null || key === 'null' || key === 'undefined') {
        console.log('[AnthropicConfig] Ключ в localStorage равен null или невалидному значению');
        return '';
      }
      return key;
    } catch (e) {
      console.error('[AnthropicConfig] Ошибка при чтении API ключа из localStorage:', e);
      return '';
    }
  } catch (e) {
    console.error('[AnthropicConfig] Непредвиденная ошибка при получении API ключа:', e);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    // Проверяем доступность localStorage перед любой операцией
    if (!isLocalStorageAvailable()) {
      console.warn('[AnthropicConfig] localStorage недоступен, ключ не будет сохранен');
      return;
    }
    
    try {
      localStorage.setItem(ANTHROPIC_API_KEY_STORAGE, key);
    } catch (e) {
      console.error('[AnthropicConfig] Ошибка при сохранении API ключа в localStorage:', e);
    }
  } catch (e) {
    console.error('[AnthropicConfig] Непредвиденная ошибка при сохранении API ключа:', e);
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  try {
    const key = getApiKey();
    return key !== '' && key.length > 10;
  } catch (e) {
    console.error('[AnthropicConfig] Ошибка при проверке API ключа:', e);
    return false;
  }
};
