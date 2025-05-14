
import { useState } from 'react';
import { toast } from "sonner";
import { setSupabaseAIConfig, getSupabaseAIConfig } from "@/services/api/supabase/config";

export const useSupabaseConfig = () => {
  console.log('[useSupabaseConfig] Инициализация хука');
  
  // Безопасно получаем конфигурацию
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    console.log('[Settings] Инициализация состояния supabaseConfig');
    try {
      // Очищаем localStorage перед получением, чтобы предотвратить ошибки
      try {
        const raw = localStorage.getItem('supabase_ai_config');
        if (raw && (raw === 'undefined' || raw === 'null' || !raw.startsWith('{'))) {
          console.warn('[useSupabaseConfig] Обнаружен невалидный JSON в localStorage, очищаем');
          localStorage.removeItem('supabase_ai_config');
        }
      } catch (e) {
        console.error('[useSupabaseConfig] Ошибка при проверке localStorage:', e);
      }
      
      const config = getSupabaseAIConfig();
      console.log('[useSupabaseConfig] Получена конфигурация:', config);
      return config;
    } catch (error) {
      console.error('[Settings] Ошибка при получении конфигурации:', error);
      console.log('[useSupabaseConfig] Возвращаем дефолтные настройки из-за ошибки');
      return {
        useSupabaseBackend: true,
        fallbackToDirectCalls: true
      };
    }
  });
  
  const handleSupabaseBackendChange = (checked: boolean) => {
    try {
      console.log('[useSupabaseConfig] handleSupabaseBackendChange:', checked);
      const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
      setSupabaseConfig(newConfig);
    } catch (error) {
      console.error('[Settings] Ошибка при изменении настройки useSupabaseBackend:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };

  const handleFallbackChange = (checked: boolean) => {
    try {
      console.log('[useSupabaseConfig] handleFallbackChange:', checked);
      const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
      setSupabaseConfig(newConfig);
    } catch (error) {
      console.error('[Settings] Ошибка при изменении настройки fallbackToDirectCalls:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };
  
  return {
    supabaseConfig,
    handleSupabaseBackendChange,
    handleFallbackChange
  };
};
