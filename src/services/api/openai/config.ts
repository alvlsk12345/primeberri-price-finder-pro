
// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  try {
    return localStorage.getItem('openai_api_key') || '';
  } catch (error) {
    console.error('Ошибка при получении API ключа OpenAI:', error);
    return '';
  }
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  try {
    localStorage.setItem('openai_api_key', key);
  } catch (error) {
    console.error('Ошибка при сохранении API ключа OpenAI:', error);
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key.startsWith('sk-');
};

