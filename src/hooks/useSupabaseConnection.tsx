
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  isSupabaseConnected, 
  checkSupabaseConnection 
} from "@/services/api/supabase/client";
import { 
  isUsingSupabaseBackend, 
  isFallbackEnabled,
  getSupabaseAIConfig, 
  setSupabaseAIConfig 
} from "@/services/api/supabase/config";

export function useSupabaseConnection() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [useSupabaseBE, setUseSupabaseBE] = useState<boolean>(isUsingSupabaseBackend());
  const [useFallback, setUseFallback] = useState<boolean>(isFallbackEnabled());

  // Проверяем подключение к Supabase при загрузке
  useEffect(() => {
    async function checkConnection() {
      setSupabaseStatus('checking');
      try {
        const connected = await checkSupabaseConnection();
        console.log('Результат проверки подключения к Supabase:', connected);
        setSupabaseConnected(connected);
        setSupabaseStatus(connected ? 'connected' : 'disconnected');
        if (connected) {
          toast.success('Соединение с Supabase установлено', { duration: 3000 });
        }
      } catch (error) {
        console.error('Ошибка при проверке подключения к Supabase:', error);
        setSupabaseConnected(false);
        setSupabaseStatus('disconnected');
      }
    }
    
    checkConnection();
  }, []);
  
  // Получаем настройки Supabase AI
  useEffect(() => {
    const config = getSupabaseAIConfig();
    setUseSupabaseBE(config.useSupabaseBackend);
    setUseFallback(config.fallbackToDirectCalls);
  }, []);

  // Функция для изменения режима работы с Supabase
  const handleSupabaseBackendChange = (checked: boolean) => {
    setUseSupabaseBE(checked);
    setSupabaseAIConfig({ useSupabaseBackend: checked });
    
    if (checked && !supabaseConnected) {
      toast.warning('Supabase не подключен. Проверьте настройки подключения или используйте прямое соединение.', 
                 { duration: 5000 });
    } else if (checked) {
      toast.success('Режим Supabase Backend активирован', { duration: 3000 });
    } else {
      toast.info('Используется прямое соединение с API', { duration: 3000 });
    }
  };
  
  // Функция для изменения режима фоллбэка
  const handleFallbackChange = (checked: boolean) => {
    setUseFallback(checked);
    setSupabaseAIConfig({ fallbackToDirectCalls: checked });
    
    if (checked) {
      toast.success('Фоллбэк на прямые вызовы API активирован', { duration: 3000 });
    } else {
      toast.info('Фоллбэк на прямые вызовы API отключен', { duration: 3000 });
    }
  };

  return {
    supabaseConnected,
    supabaseStatus,
    useSupabaseBE,
    useFallback,
    handleSupabaseBackendChange,
    handleFallbackChange
  };
}
