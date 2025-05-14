
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
  
  // Загружаем конфигурацию после монтирования компонента
  useEffect(() => {
    console.log('[useSupabaseConfig] useEffect для получения начальной конфигурации');
    
    let isMounted = true; // Флаг для предотвращения setState после размонтирования

    const loadConfig = () => {
      console.log('[useSupabaseConfig] Начинаем загрузку конфигурации');
      setIsLoading(true);
      
      try {
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
          // Используем дефолтные значения при ошибке
          console.warn('[useSupabaseConfig] Используем дефолтные настройки из-за ошибки');
          setSupabaseConfig(DEFAULT_HOOK_CONFIG);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    // Запускаем загрузку с небольшой задержкой для стабилизации маршрута
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
