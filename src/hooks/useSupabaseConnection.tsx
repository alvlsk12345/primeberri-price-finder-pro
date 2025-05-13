
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  getConnectionState, 
  checkSupabaseConnection, 
  subscribeToConnectionState 
} from "@/services/api/supabase/connectionService";
import { 
  isUsingSupabaseBackend, 
  isFallbackEnabled,
  getSupabaseAIConfig, 
  setSupabaseAIConfig 
} from "@/services/api/supabase/config";

export function useSupabaseConnection() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(getConnectionState().isConnected);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>(
    getConnectionState().status === 'unknown' ? 'checking' : 
    getConnectionState().status as 'checking' | 'connected' | 'disconnected'
  );
  const [useSupabaseBE, setUseSupabaseBE] = useState<boolean>(isUsingSupabaseBackend());
  const [useFallback, setUseFallback] = useState<boolean>(isFallbackEnabled());
  
  // Подписываемся на изменения состояния соединения
  useEffect(() => {
    // Получаем начальное состояние
    const initialState = getConnectionState();
    setSupabaseConnected(initialState.isConnected);
    setSupabaseStatus(initialState.status === 'unknown' ? 'checking' : 
                     initialState.status as 'checking' | 'connected' | 'disconnected');
    
    // Подписываемся на обновления состояния
    const unsubscribe = subscribeToConnectionState((state) => {
      setSupabaseConnected(state.isConnected);
      setSupabaseStatus(state.status === 'unknown' ? 'checking' : 
                      state.status as 'checking' | 'connected' | 'disconnected');
      
      if (state.status === 'connected' && state.isConnected) {
        toast.success('Соединение с Supabase установлено', { 
          duration: 3000, 
          id: 'supabase-connected' 
        });
      }
    });
    
    // Получаем настройки
    const config = getSupabaseAIConfig();
    setUseSupabaseBE(config.useSupabaseBackend);
    setUseFallback(config.fallbackToDirectCalls);
    
    return () => {
      unsubscribe();
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
