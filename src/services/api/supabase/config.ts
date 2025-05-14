
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
    console.log('[SupabaseConfig] Проверяем доступность localStorage');
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    console.log('[SupabaseConfig] localStorage доступен');
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
  console.log(`[SupabaseConfig] Пытаемся прочитать из localStorage по ключу: ${key}`);
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('[SupabaseConfig] localStorage недоступен, возвращаем null');
      return null;
    }
    
    console.log('[SupabaseConfig] localStorage доступен, пытаемся получить данные');
    const data = localStorage.getItem(key);
    console.log(`[SupabaseConfig] Прочитанные данные: ${data}`);
    
    // Проверяем, что данные существуют и не являются "undefined"/"null" строками
    if (!data || data === 'undefined' || data === 'null') {
      console.warn(`[SupabaseConfig] Данные отсутствуют или имеют недопустимое значение: ${data}`);
      return null;
    }
    
    // Базовая проверка на формат JSON
    if (!data.startsWith('{') || !data.endsWith('}')) {
      console.warn(`[SupabaseConfig] Данные в localStorage не похожи на JSON: ${data}`);
      try {
        localStorage.removeItem(key);
        console.log(`[SupabaseConfig] Удалили некорректные данные из localStorage для ключа: ${key}`);
      } catch (removeError) {
        console.error(`[SupabaseConfig] Не удалось удалить данные из localStorage для ключа: ${key}`, removeError);
      }
      return null;
    }
    
    console.log('[SupabaseConfig] Данные успешно прочитаны и прошли базовую валидацию');
    return data;
  } catch (e) {
    console.error(`[SupabaseConfig] Ошибка при чтении из localStorage (ключ: ${key}):`, e);
    return null;
  }
}

// Получение текущей конфигурации с улучшенной обработкой ошибок
export function getSupabaseAIConfig(): SupabaseAIConfig {
  console.log('[SupabaseConfig] Начало выполнения getSupabaseAIConfig');
  
  try {
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
          try {
            if (isLocalStorageAvailable()) {
              localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
              console.log('[SupabaseConfig] Удалили некорректные данные из localStorage');
            }
          } catch (removeError) {
            console.error('[SupabaseConfig] Не удалось удалить данные из localStorage:', removeError);
          }
          console.log('[SupabaseConfig] Возвращаем дефолтную конфигурацию из-за некорректного формата');
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
        try {
          if (isLocalStorageAvailable()) {
            localStorage.removeItem(SUPABASE_AI_CONFIG_KEY);
            console.log('[SupabaseConfig] Успешно удалили некорректные данные из localStorage');
          }
        } catch (removeError) {
          console.error('[SupabaseConfig] Не удалось удалить данные из localStorage:', removeError);
        }
        console.log('[SupabaseConfig] Возвращаем дефолтную конфигурацию из-за ошибки парсинга');
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
        console.log('[SupabaseConfig] Локальное хранилище очищено от поврежденных данных');
      }
    } catch (clearError) {
      console.error('[SupabaseConfig] Не удалось очистить localStorage:', clearError);
    }
    
    return { ...DEFAULT_CONFIG };
  }
}

// Сохранение конфигурации
export function setSupabaseAIConfig(config: Partial<SupabaseAIConfig>): SupabaseAIConfig {
  console.log('[SupabaseConfig] Начало выполнения setSupabaseAIConfig с конфигурацией:', config);
  try {
    // Проверяем доступность localStorage
    if (!isLocalStorageAvailable()) {
      console.warn('[SupabaseConfig] localStorage недоступен, настройки будут временными');
      return { ...DEFAULT_CONFIG, ...config };
    }
    
    // Получаем текущие настройки, безопасно обрабатывая потенциальные ошибки
    let currentConfig: SupabaseAIConfig;
    try {
      currentConfig = getSupabaseAIConfig();
      console.log('[SupabaseConfig] Текущие настройки получены успешно:', currentConfig);
    } catch (e) {
      console.error('[SupabaseConfig] Ошибка при получении текущих настроек, используем дефолтные:', e);
      currentConfig = { ...DEFAULT_CONFIG };
    }
    
    // Объединяем текущие настройки с новыми
    const newConfig = { ...currentConfig, ...config };
    console.log('[SupabaseConfig] Новая конфигурация после объединения:', newConfig);
    
    // Сохраняем в localStorage
    try {
      const jsonString = JSON.stringify(newConfig);
      localStorage.setItem(SUPABASE_AI_CONFIG_KEY, jsonString);
      console.log('[SupabaseConfig] Настройки успешно сохранены в localStorage');
    } catch (e) {
      console.error('[SupabaseConfig] Ошибка при сохранении настроек в localStorage:', e);
    }
    
    console.log('[SupabaseConfig] Возвращаем новую конфигурацию:', newConfig);
    return newConfig;
  } catch (e) {
    console.error('[SupabaseConfig] Ошибка при сохранении настроек Supabase AI:', e);
    // Возвращаем объединенные настройки, даже если не удалось сохранить их в localStorage
    return { ...DEFAULT_CONFIG, ...config };
  }
}

// Проверка использования Supabase бэкенда для AI
export function isUsingSupabaseBackend(): boolean {
  console.log('[SupabaseConfig] Проверка использования Supabase бэкенда');
  try {
    const config = getSupabaseAIConfig();
    console.log('[SupabaseConfig] Конфигурация получена, useSupabaseBackend =', config.useSupabaseBackend);
    return config.useSupabaseBackend;
  } catch (e) {
    console.error('[SupabaseConfig] Ошибка при проверке использования Supabase бэкенда:', e);
    // По умолчанию используем Supabase при ошибке
    return DEFAULT_CONFIG.useSupabaseBackend;
  }
}

// Проверка использования фоллбэка на прямые вызовы
export function isFallbackEnabled(): boolean {
  console.log('[SupabaseConfig] Проверка использования фоллбэка');
  try {
    const config = getSupabaseAIConfig();
    console.log('[SupabaseConfig] Конфигурация получена, fallbackToDirectCalls =', config.fallbackToDirectCalls);
    return config.fallbackToDirectCalls;
  } catch (e) {
    console.error('[SupabaseConfig] Ошибка при проверке использования фоллбэка:', e);
    // По умолчанию используем фоллбэк при ошибке
    return DEFAULT_CONFIG.fallbackToDirectCalls;
  }
}
