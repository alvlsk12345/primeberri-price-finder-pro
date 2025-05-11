
// Проверка на использование бэкенда Supabase
// Эта настройка влияет на то, будут ли запросы к AI API проходить через Edge Functions

let useSupabaseBackend = true; // По умолчанию используем Supabase
let useFallback = true; // Использовать ли fallback при ошибках

// Функция для проверки, используем ли мы Supabase бэкенд
export const isUsingSupabaseBackend = (): boolean => {
  return useSupabaseBackend;
};

// Функция для установки флага использования Supabase
export const setUseSupabaseBackend = (value: boolean): void => {
  useSupabaseBackend = value;
};

// Функция для проверки, используем ли fallback при ошибках
export const isFallbackEnabled = (): boolean => {
  return useFallback;
};

// Функция для установки флага использования fallback
export const setFallbackEnabled = (value: boolean): void => {
  useFallback = value;
};
