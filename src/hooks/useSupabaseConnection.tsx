
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  checkConnection, 
  subscribeToConnectionState,
  getConnectionState,
  ConnectionStatus
} from '@/services/api/supabase/connectionService';
import { 
  isUsingSupabaseBackend, 
  setUseSupabaseBackend,
  isFallbackEnabled,
  setFallbackEnabled 
} from '@/services/api/supabase/config';

export const useSupabaseConnection = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionStatus>(
    getConnectionState().status
  );
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(
    getConnectionState().isConnected
  );
  const [useSupabaseBE, setUseSupabaseBE] = useState<boolean>(
    isUsingSupabaseBackend()
  );
  const [useFallback, setUseFallback] = useState<boolean>(
    isFallbackEnabled()
  );

  // Подписываемся на изменения статуса соединения
  useEffect(() => {
    const unsubscribe = subscribeToConnectionState((state) => {
      setSupabaseStatus(state.status);
      setSupabaseConnected(state.isConnected);
    });

    // Выполняем проверку соединения при монтировании
    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  // Обработчик изменения использования Supabase Backend
  const handleSupabaseBackendChange = (checked: boolean) => {
    setUseSupabaseBE(checked);
    setUseSupabaseBackend(checked);
    
    toast.success(
      checked 
        ? 'Supabase Backend включен'
        : 'Supabase Backend отключен'
    );
    
    // Если отключаем Supabase Backend, отключаем и фоллбэк
    if (!checked) {
      setUseFallback(false);
      setFallbackEnabled(false);
    }
  };

  // Обработчик изменения использования фоллбэка
  const handleFallbackChange = (checked: boolean) => {
    setUseFallback(checked);
    setFallbackEnabled(checked);
    
    toast.success(
      checked 
        ? 'Фоллбэк на прямые вызовы включен'
        : 'Фоллбэк на прямые вызовы отключен'
    );
  };

  return {
    supabaseStatus,
    supabaseConnected,
    useSupabaseBE,
    useFallback,
    handleSupabaseBackendChange,
    handleFallbackChange
  };
};
