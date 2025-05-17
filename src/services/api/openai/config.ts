
// Модуль для работы с конфигурациями OpenAI API
import { toast } from "sonner";
import { getApiKey as getApiKeyGeneric, setApiKey as setApiKeyGeneric } from '../apiKeyService';

// Константа для названия ключа в localStorage
const OPENAI_API_KEY = 'openai_api_key';

// Функция для получения API ключа
export const getApiKey = async (): Promise<string> => {
  return getApiKeyGeneric('openai');
};

// Функция для установки API ключа
export const setApiKey = async (apiKey: string): Promise<boolean> => {
  return setApiKeyGeneric('openai', apiKey);
};

// Функция для сброса API ключа (удаления)
export const resetApiKey = (): void => {
  localStorage.removeItem(OPENAI_API_KEY);
  toast.success("API ключ OpenAI успешно удален", { duration: 3000 });
  console.log("OpenAI API ключ сброшен");
};

// Функция для проверки валидности API ключа
export const hasValidApiKey = async (): Promise<boolean> => {
  const apiKey = await getApiKey();
  // Простая проверка на формат ключа OpenAI
  return /^sk-[A-Za-z0-9]{32,}$/.test(apiKey);
};

// Реэкспортируем функцию callOpenAI из apiClient
export { callOpenAI } from './apiClient';
