
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { setSupabaseAIConfig, getSupabaseAIConfig, SupabaseAIConfig } from "@/services/api/supabase/config";

// Значения по умолчанию для хука (дублируем для надежности)
const DEFAULT_HOOK_CONFIG: SupabaseAIConfig = {
  useSupabaseBackend: true,
  fallbackToDirectCalls: true
};

// Функция безопасной задержки
const safeSetTimeout = (callback: () => void, delay: number): number => {
  try {
    return window.setTimeout(callback, delay);
  } catch (e) {
    console.error('[useSupabaseConfig] Ошибка при вызове setTimeout:', e);
    // Немедленно вызываем колбэк в случае ошибки с setTimeout
    try {
      callback();
    } catch (callbackError) {
      console.error('[useSupabaseConfig] Ошибка в колбэке setTimeout:', callbackError);
    }
    return 0;
  }
};

export const useSupabaseConfig = () => {
  console.log('[useSupabaseConfig] Инициализация хука');
  
  // Начинаем с безопасного дефолтного значения и только после успешной загрузки обновляем 
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAIConfig>(DEFAULT_HOOK_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Безопасная функция получения конфигурации
  const safeGetConfig = () => {
    console.log('[useSupabaseConfig] Выполняем safeGetConfig');
    try {
      // Проверяем доступность localStorage перед получением конфигурации
      let isLocalStorageAvailable = false;
      try {
        const testKey = '__test_settings_storage__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        isLocalStorageAvailable = true;
        console.log('[useSupabaseConfig] localStorage доступен в safeGetConfig');
      } catch (e) {
        console.error('[useSupabaseConfig] localStorage недоступен в safeGetConfig:', e);
        return DEFAULT_HOOK_CONFIG;
      }
      
      if (!isLocalStorageAvailable) {
        console.warn('[useSupabaseConfig] localStorage недоступен, используем дефолтные настройки');
        return DEFAULT_HOOK_CONFIG;
      }
      
      // Получаем конфигурацию, обрабатывая потенциальные ошибки
      try {
        console.log('[useSupabaseConfig] Вызываем getSupabaseAIConfig()');
        return getSupabaseAIConfig();
      } catch (configError) {
        console.error('[useSupabaseConfig] Ошибка при вызове getSupabaseAIConfig():', configError);
        return DEFAULT_HOOK_CONFIG;
      }
    } catch (e) {
      console.error('[useSupabaseConfig] Общая ошибка в safeGetConfig:', e);
      return DEFAULT_HOOK_CONFIG;
    }
  };
  
  // Загружаем конфигурацию после монтирования компонента с задержкой
  useEffect(() => {
    console.log('[useSupabaseConfig] useEffect для получения начальной конфигурации');
    
    let isMounted = true; // Флаг для предотвращения setState после размонтирования
    const maxRetries = 2;

    const loadConfig = () => {
      if (!isMounted) {
        console.log('[useSupabaseConfig] Компонент размонтирован до загрузки, отменяем');
        return;
      }
      
      console.log('[useSupabaseConfig] Начинаем загрузку конфигурации');
      setIsLoading(true);
      
      try {
        // Получаем конфигурацию через безопасную функцию
        const loadedConfig = safeGetConfig();
        console.log('[useSupabaseConfig] Конфигурация загружена:', loadedConfig);
        
        // Проверяем, что компонент все еще смонтирован перед обновлением состояния
        if (isMounted) {
          // Обновляем состояние полученными значениями
          setSupabaseConfig(loadedConfig);
          setIsLoading(false);
          setHasError(false);
          console.log('[useSupabaseConfig] Состояние успешно обновлено');
        } else {
          console.warn('[useSupabaseConfig] Компонент размонтирован, пропускаем обновление состояния');
        }
      } catch (error) {
        console.error('[useSupabaseConfig] Ошибка при загрузке конфигурации:', error);
        
        if (isMounted) {
          if (retryCount < maxRetries) {
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            console.log(`[useSupabaseConfig] Повторная попытка ${newRetryCount} из ${maxRetries}...`);
            
            // Повторная попытка с увеличенной задержкой
            safeSetTimeout(() => loadConfig(), 500 * newRetryCount);
          } else {
            // Используем дефолтные значения при ошибке после всех попыток
            console.warn('[useSupabaseConfig] Используем дефолтные настройки из-за ошибки');
            setSupabaseConfig(DEFAULT_HOOK_CONFIG);
            setHasError(true);
            setIsLoading(false);
            
            try {
              toast.error('Не удалось загрузить настройки', {
                description: 'Используются значения по умолчанию'
              });
            } catch (toastError) {
              console.error('[useSupabaseConfig] Ошибка при отображении toast:', toastError);
            }
          }
        }
      }
    };

    // Запускаем загрузку с задержкой для стабилизации маршрута
    const timerId = safeSetTimeout(() => {
      console.log('[useSupabaseConfig] Запускаем загрузку конфигурации после задержки');
      loadConfig();
    }, 500); // Увеличенная задержка для стабильности
    
    return () => {
      console.log('[useSupabaseConfig] Размонтирование хука');
      isMounted = false; // Предотвращаем обновление состояния после размонтирования
      try {
        clearTimeout(timerId);
      } catch (e) {
        console.error('[useSupabaseConfig] Ошибка при очистке таймера:', e);
      }
    };
  }, [retryCount]);
  
  const handleSupabaseBackendChange = (checked: boolean) => {
    try {
      console.log('[useSupabaseConfig] handleSupabaseBackendChange:', checked);
      const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
      setSupabaseConfig(newConfig);
      toast.success('Настройка сохранена');
    } catch (error) {
      console.error('[useSupabaseConfig] Ошибка при изменении настройки useSupabaseBackend:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };

  const handleFallbackChange = (checked: boolean) => {
    try {
      console.log('[useSupabaseConfig] handleFallbackChange:', checked);
      const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
      setSupabaseConfig(newConfig);
      toast.success('Настройка сохранена');
    } catch (error) {
      console.error('[useSupabaseConfig] Ошибка при изменении настройки fallbackToDirectCalls:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };
  
  return {
    supabaseConfig,
    isLoading,
    hasError,
    handleSupabaseBackendChange,
    handleFallbackChange
  };
};
