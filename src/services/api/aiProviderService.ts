
// Ключ для хранения выбранного провайдера AI в localStorage
const AI_PROVIDER_STORAGE_KEY = 'ai_provider';

// Типы провайдеров AI, поддерживаемых приложением
export type AIProvider = 'openai' | 'abacus' | 'perplexity';

// Значение провайдера AI по умолчанию
const DEFAULT_PROVIDER: AIProvider = 'openai';

/**
 * Получение выбранного провайдера AI из localStorage
 * @returns Выбранный провайдер AI или провайдер по умолчанию
 */
export const getSelectedAIProvider = (): AIProvider => {
  try {
    const savedProvider = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
    
    // Проверяем, является ли сохраненный провайдер допустимым значением
    if (
      savedProvider === 'openai' ||
      savedProvider === 'abacus' ||
      savedProvider === 'perplexity'
    ) {
      return savedProvider;
    }
    
    // Возвращаем значение по умолчанию для недопустимых или отсутствующих значений
    return DEFAULT_PROVIDER;
  } catch (error) {
    console.error('Ошибка при получении провайдера AI из localStorage:', error);
    return DEFAULT_PROVIDER; // Возвращаем значение по умолчанию в случае ошибки
  }
};

/**
 * Установка выбранного провайдера AI в localStorage
 * @param provider Провайдер AI для сохранения
 */
export const setSelectedAIProvider = (provider: AIProvider): void => {
  try {
    localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
    console.log(`Установлен провайдер AI: ${provider}`);
  } catch (error) {
    console.error('Ошибка при сохранении провайдера AI в localStorage:', error);
  }
};

/**
 * Получение отображаемого имени для провайдера AI
 * @param provider Провайдер AI
 * @returns Отображаемое имя провайдера
 */
export const getProviderDisplayName = (provider: AIProvider): string => {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'abacus':
      return 'Abacus.AI';
    case 'perplexity':
      return 'Perplexity';
    default:
      return 'Неизвестный провайдер';
  }
};

/**
 * Получение названия модели для провайдера AI
 * @param provider Провайдер AI
 * @returns Название модели провайдера
 */
export const getProviderModelName = (provider: AIProvider): string => {
  switch (provider) {
    case 'openai':
      return 'GPT-4o';
    case 'abacus':
      return 'Llama 3';
    case 'perplexity':
      return 'Llama 3.1 Sonar';
    default:
      return 'Неизвестная модель';
  }
};
