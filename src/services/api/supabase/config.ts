
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
    console.log('Получение настроек Supabase AI из localStorage');
    const savedConfig = localStorage.getItem(SUPABASE_AI_CONFIG_KEY);
    
    // Проверяем, есть ли данные
    if (!savedConfig) {
      console.log('Настройки Supabase AI не найдены, используем значения по умолчанию');
      return DEFAULT_CONFIG;
    }
    
    // Пробуем распарсить JSON
    try {
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
      
      console.log('Загружены настройки Supabase AI:', mergedConfig);
      return mergedConfig;
    } catch (parseError) {
      console.error('Ошибка при парсинге настроек Supabase AI:', parseError);
      // Удаляем повреждённые данные
      localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
      return DEFAULT_CONFIG;
    }
  } catch (e) {
    console.error('Ошибка при получении настроек Supabase AI:', e);
    // Удаляем повреждённые данные
    try {
      localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
    } catch (removeError) {
      console.error('Не удалось удалить поврежденные данные из localStorage:', removeError);
    }
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
    const configString = JSON.stringify(newConfig);
    localStorage.setItem(SUPABASE_AI_CONFIG_KEY, configString);
    console.log('Настройки Supabase AI успешно сохранены:', newConfig);
    return newConfig;
  } catch (e) {
    console.error('Ошибка при сохранении настроек Supabase AI:', e);
    return DEFAULT_CONFIG;
  }
}

// Проверка использования Supabase бэкенда для AI
export function isUsingSupabaseBackend(): boolean {
  try {
    return getSupabaseAIConfig().useSupabaseBackend;
  } catch (error) {
    console.error('Ошибка при проверке использования Supabase бэкенда:', error);
    return DEFAULT_CONFIG.useSupabaseBackend;
  }
}

// Проверка использования фоллбэка на прямые вызовы
export function isFallbackEnabled(): boolean {
  try {
    return getSupabaseAIConfig().fallbackToDirectCalls;
  } catch (error) {
    console.error('Ошибка при проверке фоллбэка:', error);
    return DEFAULT_CONFIG.fallbackToDirectCalls;
  }
}
