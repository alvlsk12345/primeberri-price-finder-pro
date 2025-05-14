
// Функция для получения API ключа из localStorage
export const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || '';
};

// Функция для сохранения API ключа в localStorage
export const setApiKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key.startsWith('sk-');
};
