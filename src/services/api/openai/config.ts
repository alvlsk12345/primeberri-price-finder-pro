
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
    console.log('API ключ OpenAI успешно сохранен');
  } catch (error) {
    console.error('Ошибка при сохранении API ключа OpenAI:', error);
  }
};

// Функция для сброса API ключа OpenAI
export const resetApiKey = (): boolean => {
  try {
    console.log('Выполняется сброс API ключа OpenAI...');
    localStorage.removeItem('openai_api_key');
    console.log('API ключ OpenAI успешно удален');
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе API ключа OpenAI:', error);
    return false;
  }
};

// Функция для проверки наличия действительного API ключа
export const hasValidApiKey = (): boolean => {
  try {
    const key = getApiKey();
    return key !== '' && key.startsWith('sk-');
  } catch (error) {
    console.error('Ошибка при проверке валидности API ключа OpenAI:', error);
    return false;
  }
};
