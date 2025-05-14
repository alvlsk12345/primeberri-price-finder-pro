
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { setSupabaseAIConfig, getSupabaseAIConfig, SupabaseAIConfig } from "@/services/api/supabase/config";

// Значения по умолчанию для хука (дублируем для надежности)
const DEFAULT_HOOK_CONFIG: SupabaseAIConfig = {
  useSupabaseBackend: true,
  fallbackToDirectCalls: true
};

export const useSupabaseConfig = () => {
  console.log('[useSupabaseConfig] Инициализация хука');
  
  // Начинаем с безопасного дефолтного значения и только после успешной загрузки обновляем 
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAIConfig>(DEFAULT_HOOK_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Загружаем конфигурацию после монтирования компонента с задержкой
  useEffect(() => {
    console.log('[useSupabaseConfig] useEffect для получения начальной конфигурации');
    
    let isMounted = true; // Флаг для предотвращения setState после размонтирования
    let retryCount = 0;
    const maxRetries = 2;

    const loadConfig = () => {
      if (!isMounted) {
        console.log('[useSupabaseConfig] Компонент размонтирован до загрузки, отменяем');
        return;
      }
      
      console.log('[useSupabaseConfig] Начинаем загрузку конфигурации');
      setIsLoading(true);
      
      try {
        // Проверяем доступность localStorage перед получением конфигурации
        let isLocalStorageAvailable = false;
        try {
          const testKey = '__test_settings_storage__';
          localStorage.setItem(testKey, testKey);
          localStorage.removeItem(testKey);
          isLocalStorageAvailable = true;
          console.log('[useSupabaseConfig] localStorage доступен');
        } catch (e) {
          console.error('[useSupabaseConfig] localStorage недоступен:', e);
          if (isMounted) {
            toast.error('Проблемы с доступом к хранилищу', {
              description: 'Настройки будут загружены со значениями по умолчанию'
            });
            setHasError(true);
            setSupabaseConfig(DEFAULT_HOOK_CONFIG);
            setIsLoading(false);
          }
          return;
        }
        
        if (!isLocalStorageAvailable) {
          console.warn('[useSupabaseConfig] localStorage недоступен, используем дефолтные настройки');
          if (isMounted) {
            setSupabaseConfig(DEFAULT_HOOK_CONFIG);
            setHasError(true);
            setIsLoading(false);
          }
          return;
        }
        
        // Получаем конфигурацию вне useState для безопасности
        console.log('[useSupabaseConfig] Вызываем getSupabaseAIConfig()');
        const loadedConfig = getSupabaseAIConfig();
        console.log('[useSupabaseConfig] Конфигурация успешно загружена:', loadedConfig);
        
        // Проверяем, что компонент все еще смонтирован перед обновлением состояния
        if (isMounted) {
          // Обновляем состояние полученными значениями
          setSupabaseConfig(loadedConfig);
          console.log('[useSupabaseConfig] Состояние успешно обновлено');
          setIsLoading(false);
        } else {
          console.warn('[useSupabaseConfig] Компонент размонтирован, пропускаем обновление состояния');
        }
      } catch (error) {
        console.error('[useSupabaseConfig] Ошибка при загрузке конфигурации:', error);
        
        if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`[useSupabaseConfig] Повторная попытка ${retryCount} из ${maxRetries}...`);
            // Повторная попытка с увеличенной задержкой
            setTimeout(loadConfig, 300 * retryCount);
          } else {
            // Используем дефолтные значения при ошибке после всех попыток
            console.warn('[useSupabaseConfig] Используем дефолтные настройки из-за ошибки');
            setSupabaseConfig(DEFAULT_HOOK_CONFIG);
            setHasError(true);
            setIsLoading(false);
            
            toast.error('Не удалось загрузить настройки', {
              description: 'Используются значения по умолчанию'
            });
          }
        }
      }
    };

    // Запускаем загрузку с задержкой для стабилизации маршрута
    const timerId = setTimeout(() => {
      console.log('[useSupabaseConfig] Запускаем загрузку конфигурации после задержки');
      loadConfig();
    }, 300);
    
    return () => {
      console.log('[useSupabaseConfig] Размонтирование хука');
      isMounted = false; // Предотвращаем обновление состояния после размонтирования
      clearTimeout(timerId);
    };
  }, []);
  
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
