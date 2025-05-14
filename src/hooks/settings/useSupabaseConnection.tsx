
import { useState } from 'react';
import { toast } from "sonner";
import { checkSupabaseConnection, clearConnectionCache } from "@/services/api/supabase/client";
import { getRouteInfo } from '@/utils/navigation';

export const useSupabaseConnection = () => {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<null | boolean>(null);
  
  // Функция для проверки соединения с Supabase - ТОЛЬКО ПО НАЖАТИЮ КНОПКИ
  const handleCheckConnection = async () => {
    // Проверяем, что это действительно страница настроек
    const routeInfo = getRouteInfo();
    if (!routeInfo.isSettings) {
      console.warn('[Settings] handleCheckConnection: отменено, так как это не страница настроек');
      return;
    }
    
    setCheckingStatus(true);
    setConnectionStatus(null);
    
    try {
      toast.loading("Проверка соединения с Supabase...", {
        id: 'check-connection-toast'
      });
      
      // Очищаем кеш состояния подключения перед проверкой
      clearConnectionCache();
      
      // Явное требование проверки соединения с принудительным обновлением кеша
      const isConnected = await checkSupabaseConnection(true);
      
      // Повторно проверяем, что мы все еще на странице настроек
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        console.warn('[Settings] handleCheckConnection: отменено обновление UI, так как маршрут изменился');
        toast.dismiss('check-connection-toast');
        return;
      }
      
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        toast.success("Соединение с Supabase успешно установлено", {
          description: "Edge Functions доступны для использования",
          duration: 5000
        });
      } else {
        toast.error("Не удалось установить соединение с Supabase", {
          description: "Проверьте настройки и доступность Supabase Edge Functions",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("[Settings] Ошибка при проверке соединения:", error);
      
      // Повторно проверяем маршрут
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        toast.dismiss('check-connection-toast');
        return;
      }
      
      setConnectionStatus(false);
      toast.error("Произошла ошибка при проверке соединения", {
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        duration: 5000
      });
    } finally {
      // Проверяем маршрут перед обновлением состояния
      const finalRouteInfo = getRouteInfo();
      if (finalRouteInfo.isSettings) {
        setCheckingStatus(false);
      }
      toast.dismiss('check-connection-toast');
    }
  };

  return {
    checkingStatus,
    connectionStatus,
    handleCheckConnection
  };
};
