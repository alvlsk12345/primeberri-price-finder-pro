
// Константа для названия ключа в localStorage
const AI_PROVIDER_KEY = 'selected_ai_provider';

// Типы поддерживаемых AI провайдеров
export type AIProvider = 'openai' | 'abacus';

// Установка провайдера по умолчанию (OpenAI)
export const DEFAULT_PROVIDER: AIProvider = 'openai';

// Функция для получения текущего выбранного провайдера
export const getSelectedAIProvider = (): AIProvider => {
  const provider = localStorage.getItem(AI_PROVIDER_KEY);
  return (provider as AIProvider) || DEFAULT_PROVIDER;
};

// Функция для установки провайдера
export const setSelectedAIProvider = (provider: AIProvider): void => {
  localStorage.setItem(AI_PROVIDER_KEY, provider);
};

// Функция для получения названия провайдера для отображения
export const getProviderDisplayName = (provider: AIProvider): string => {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'abacus':
      return 'Abacus.ai';
    default:
      return 'AI Provider';
  }
};

// Функция для получения модели или версии провайдера
export const getProviderModelName = (provider: AIProvider): string => {
  switch (provider) {
    case 'openai':
      return 'GPT-4o-search-preview';
    case 'abacus':
      return 'Text Generation Model';
    default:
      return 'AI Model';
  }
};
