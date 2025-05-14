
// Модуль для работы с конфигурациями OpenAI API
import { toast } from "sonner";

// Константа для названия ключа в localStorage
const OPENAI_API_KEY = 'openai_api_key';

// Функция для получения API ключа
export const getApiKey = (): string => {
  return localStorage.getItem(OPENAI_API_KEY) || '';
};

// Функция для установки API ключа
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(OPENAI_API_KEY, apiKey);
};

// Функция для сброса API ключа (удаления)
export const resetApiKey = (): void => {
  localStorage.removeItem(OPENAI_API_KEY);
  toast.success("API ключ OpenAI успешно удален", { duration: 3000 });
  console.log("OpenAI API ключ сброшен");
};

// Функция для проверки валидности API ключа
export const hasValidApiKey = (): boolean => {
  const apiKey = getApiKey();
  // Простая проверка на формат ключа OpenAI
  return /^sk-[A-Za-z0-9]{32,}$/.test(apiKey);
};

// Реэкспортируем функцию callOpenAI из apiClient
export { callOpenAI } from './apiClient';

