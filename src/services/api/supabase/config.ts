
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

/**
 * Безопасная проверка доступности localStorage
 * @returns true если localStorage доступен, false в противном случае
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('[SupabaseConfig] localStorage недоступен:', e);
    return false;
  }
}

/**
 * Безопасное чтение из localStorage с проверкой валидности JSON
 * @returns Данные из localStorage или null в случае ошибки
 */
function safeReadFromLocalStorage(key: string): string | null {
  try {
    if (!isLocalStorageAvailable()) {
      return null;
    }
    
    const data = localStorage.getItem(key);
    
    // Проверяем, что данные существуют и не являются "undefined"/"null" строками
    if (!data || data === 'undefined' || data === 'null') {
      return null;
    }
    
    // Базовая проверка на формат JSON
    if (!data.startsWith('{') || !data.endsWith('}')) {
      console.warn(`[SupabaseConfig] Данные в localStorage не похожи на JSON: ${data}`);
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error(`[SupabaseConfig] Ошибка при чтении из localStorage (ключ: ${key}):`, e);
    return null;
  }
}

// Получение текущей конфигурации с улучшенной обработкой ошибок
export function getSupabaseAIConfig(): SupabaseAIConfig {
  try {
    console.log('[SupabaseConfig] Начало выполнения getSupabaseAIConfig');
    
    // Безопасное чтение из localStorage
    const savedConfigStr = safeReadFromLocalStorage(SUPABASE_AI_CONFIG_KEY);
    
    if (savedConfigStr) {
      console.log('[SupabaseConfig] Найдены сохраненные настройки:', savedConfigStr);
      try {
        const parsed = JSON.parse(savedConfigStr);
        console.log('[SupabaseConfig] Настройки успешно распарсены:', parsed);
        
        // Проверяем валидность конфигурации
        if (typeof parsed !== 'object' || parsed === null) {
          console.warn('[SupabaseConfig] Некорректный формат конфигурации: не объект');
          if (isLocalStorageAvailable()) {
            localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
          }
          return { ...DEFAULT_CONFIG };
        }
        
        // Убедимся, что все необходимые поля существуют
        const validConfig: SupabaseAIConfig = {
          useSupabaseBackend: typeof parsed.useSupabaseBackend === 'boolean' 
            ? parsed.useSupabaseBackend 
            : DEFAULT_CONFIG.useSupabaseBackend,
          fallbackToDirectCalls: typeof parsed.fallbackToDirectCalls === 'boolean'
            ? parsed.fallbackToDirectCalls
            : DEFAULT_CONFIG.fallbackToDirectCalls
        };
        
        console.log('[SupabaseConfig] Возвращаем валидную конфигурацию:', validConfig);
        return validConfig;
      } catch (parseError) {
        console.error('[SupabaseConfig] Ошибка при парсинге настроек:', parseError);
        console.warn('[SupabaseConfig] Удаление некорректных данных из localStorage');
        if (isLocalStorageAvailable()) {
          localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
        }
        return { ...DEFAULT_CONFIG };
      }
    }
    
    console.log('[SupabaseConfig] Сохраненные настройки не найдены, используются дефолтные.');
    return { ...DEFAULT_CONFIG };
  } catch (e) {
    console.error('[SupabaseConfig] КРИТИЧЕСКАЯ ОШИБКА при получении настроек Supabase AI:', e);
    console.warn('[SupabaseConfig] Возвращены дефолтные настройки из-за ошибки.');
    
    // Пытаемся очистить потенциально проблемные данные
    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
      }
      console.log('[SupabaseConfig] Локальное хранилище очищено от поврежденных данных');
    } catch (clearError) {
      console.error('[SupabaseConfig] Не удалось очистить localStorage:', clearError);
    }
    
    return { ...DEFAULT_CONFIG };
  }
}

// Сохранение конфигурации
export function setSupabaseAIConfig(config: Partial<SupabaseAIConfig>): SupabaseAIConfig {
  try {
    // Проверяем доступность localStorage
    if (!isLocalStorageAvailable()) {
      console.warn('[SupabaseConfig] localStorage недоступен, настройки будут временными');
      return { ...DEFAULT_CONFIG, ...config };
    }
    
    // Объединяем текущие настройки с новыми
    const currentConfig = getSupabaseAIConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // Сохраняем в localStorage
    const jsonString = JSON.stringify(newConfig);
    localStorage.setItem(SUPABASE_AI_CONFIG_KEY, jsonString);
    console.log('[SupabaseConfig] Настройки успешно сохранены:', newConfig);
    return newConfig;
  } catch (e) {
    console.error('[SupabaseConfig] Ошибка при сохранении настроек Supabase AI:', e);
    return { ...DEFAULT_CONFIG, ...config };
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
