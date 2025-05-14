
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
  
  // Начинаем с безопасного дефолтного значения
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAIConfig>(DEFAULT_HOOK_CONFIG);
  
  // Загружаем конфигурацию после монтирования компонента
  useEffect(() => {
    console.log('[useSupabaseConfig] useEffect для получения начальной конфигурации');
    
    try {
      // Получаем конфигурацию вне useState для безопасности
      const loadedConfig = getSupabaseAIConfig();
      console.log('[useSupabaseConfig] Конфигурация успешно загружена:', loadedConfig);
      
      // Обновляем состояние полученными значениями
      setSupabaseConfig(loadedConfig);
    } catch (error) {
      console.error('[useSupabaseConfig] Ошибка при загрузке конфигурации:', error);
      
      // Используем дефолтные значения при ошибке
      console.warn('[useSupabaseConfig] Используем дефолтные настройки из-за ошибки');
      setSupabaseConfig(DEFAULT_HOOK_CONFIG);
    }
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
    handleSupabaseBackendChange,
    handleFallbackChange
  };
};
