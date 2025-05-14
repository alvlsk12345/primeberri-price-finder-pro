
// Константа для названия ключа в localStorage
const OPENAI_API_KEY_STORAGE = 'openai_api_key';

// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    // Проверяем доступность localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[OpenAIConfig] localStorage недоступен');
      return '';
    }
    
    const key = localStorage.getItem(OPENAI_API_KEY_STORAGE);
    return key || '';
  } catch (e) {
    console.error('[OpenAIConfig] Ошибка при получении API ключа:', e);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    // Проверяем доступность localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[OpenAIConfig] localStorage недоступен, ключ не будет сохранен');
      return;
    }
    
    localStorage.setItem(OPENAI_API_KEY_STORAGE, key);
  } catch (e) {
    console.error('[OpenAIConfig] Ошибка при сохранении API ключа:', e);
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  try {
    const key = getApiKey();
    return key !== '' && key.startsWith('sk-');
  } catch (e) {
    console.error('[OpenAIConfig] Ошибка при проверке API ключа:', e);
    return false;
  }
};
