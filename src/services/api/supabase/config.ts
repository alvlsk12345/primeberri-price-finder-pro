
// Ключ для сохранения настроек в localStorage
const SUPABASE_AI_CONFIG_KEY = 'supabase_ai_config';

// Интерфейс для конфигурации AI через Supabase
export interface SupabaseAIConfig {
  useSupabaseBackend: boolean; // Использовать ли Supabase для вызовов AI API
  fallbackToDirectCalls: boolean; // Использовать прямые вызовы API при недоступности Supabase
}

// Значения по умолчанию
const DEFAULT_CONFIG: SupabaseAIConfig = {
  useSupabaseBackend: true, // По умолчанию используем Supabase
  fallbackToDirectCalls: true // По умолчанию делаем фоллбэк на прямые вызовы
};

// Получение текущей конфигурации
export function getSupabaseAIConfig(): SupabaseAIConfig {
  try {
    const savedConfig = localStorage.getItem(SUPABASE_AI_CONFIG_KEY);
    
    // Проверяем, есть ли данные
    if (!savedConfig) {
      return DEFAULT_CONFIG;
    }
    
    // Пробуем распарсить JSON
    const parsedConfig = JSON.parse(savedConfig);
    
    // Проверяем структуру данных
    if (typeof parsedConfig !== 'object' || parsedConfig === null) {
      console.warn('Невалидная структура настроек Supabase AI в localStorage, используем значения по умолчанию');
      localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
      return DEFAULT_CONFIG;
    }
    
    // Проверяем наличие обязательных полей
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...parsedConfig
    };
    
    return mergedConfig;
  } catch (e) {
    console.error('Ошибка при получении настроек Supabase AI:', e);
    // Удаляем повреждённые данные
    localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
    return DEFAULT_CONFIG;
  }
}

// Сохранение конфигурации
export function setSupabaseAIConfig(config: Partial<SupabaseAIConfig>): SupabaseAIConfig {
  try {
    // Объединяем текущие настройки с новыми
    const currentConfig = getSupabaseAIConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // Сохраняем в localStorage
    localStorage.setItem(SUPABASE_AI_CONFIG_KEY, JSON.stringify(newConfig));
    return newConfig;
  } catch (e) {
    console.error('Ошибка при сохранении настроек Supabase AI:', e);
    return DEFAULT_CONFIG;
  }
}

// Проверка использования Supabase бэкенда для AI
export function isUsingSupabaseBackend(): boolean {
  return getSupabaseAIConfig().useSupabaseBackend;
}

// Проверка использования фоллбэка на прямые вызовы
export function isFallbackEnabled(): boolean {
  return getSupabaseAIConfig().fallbackToDirectCalls;
}
