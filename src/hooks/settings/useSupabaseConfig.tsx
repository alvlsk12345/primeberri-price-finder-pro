
import { useState } from 'react';
import { toast } from "sonner";
import { setSupabaseAIConfig, getSupabaseAIConfig } from "@/services/api/supabase/config";

export const useSupabaseConfig = () => {
  // Безопасно получаем конфигурацию
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    console.log('[Settings] Инициализация состояния supabaseConfig');
    try {
      return getSupabaseAIConfig();
    } catch (error) {
      console.error('[Settings] Ошибка при получении конфигурации:', error);
      return {
        useSupabaseBackend: true,
        fallbackToDirectCalls: true
      };
    }
  });
  
  const handleSupabaseBackendChange = (checked: boolean) => {
    try {
      const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
      setSupabaseConfig(newConfig);
    } catch (error) {
      console.error('[Settings] Ошибка при изменении настройки useSupabaseBackend:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };

  const handleFallbackChange = (checked: boolean) => {
    try {
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
