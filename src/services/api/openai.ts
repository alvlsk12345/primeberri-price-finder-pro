
// Создаем модуль openai для совместимости со старыми частями кода

import { 
  getApiKey, 
  setApiKey,
  resetApiKey,
  hasValidApiKey 
} from './openai/config';

export { 
  getApiKey, 
  setApiKey,
  resetApiKey,
  hasValidApiKey 
};

// Дополнительные функции, которые могут понадобиться для совместимости
export const configureOpenAI = (apiKey?: string): void => {
  if (apiKey) {
    setApiKey(apiKey);
  }
};

// Проверка наличия конфигурации OpenAI
export const hasOpenAIConfig = (): boolean => {
  return hasValidApiKey();
};
