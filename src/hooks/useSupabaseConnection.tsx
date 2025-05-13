
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
  
  // Оптимизируем: проверяем подключение только при монтировании компонента
  useEffect(() => {
    let isMounted = true;
    
    async function checkConnection() {
      if (!isMounted) return;
      
      setSupabaseStatus('checking');
      try {
        // Используем общую функцию проверки с оптимизированным кэшированием
        const connected = await isSupabaseConnected();
        
        // Проверяем, что компонент все еще смонтирован перед обновлением состояния
        if (!isMounted) return;
        
        console.debug('Результат проверки подключения к Supabase:', connected);
        setSupabaseConnected(connected);
        setSupabaseStatus(connected ? 'connected' : 'disconnected');
        
        if (connected) {
          toast.success('Соединение с Supabase установлено', { duration: 3000, id: 'supabase-connected' });
        }
      } catch (error) {
        // Проверяем, что компонент все еще смонтирован перед обновлением состояния
        if (!isMounted) return;
        
        console.error('Ошибка при проверке подключения к Supabase:', error);
        setSupabaseConnected(false);
        setSupabaseStatus('disconnected');
      }
    }
    
    // Запускаем проверку с небольшой задержкой, чтобы уменьшить нагрузку при загрузке
    const timer = setTimeout(() => {
      checkConnection();
    }, 500);
    
    // Получаем настройки с меньшей частотой обновления
    const config = getSupabaseAIConfig();
    setUseSupabaseBE(config.useSupabaseBackend);
    setUseFallback(config.fallbackToDirectCalls);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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
