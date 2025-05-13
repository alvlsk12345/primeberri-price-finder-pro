
import { supabase } from "@/integrations/supabase/client";

// Добавляем функцию для проверки соединения с Supabase
export const checkSupabaseConnection = async (logOutput: boolean = true): Promise<boolean> => {
  try {
    if (logOutput) {
      console.log('Проверка соединения с Supabase...');
    }
    
    // Проверяем соединение путем запроса общедоступной информации
    const { data, error } = await supabase.rpc('get_connection_status');
    
    if (error) {
      if (logOutput) {
        console.error('Ошибка подключения к Supabase:', error.message);
      }
      return false;
    }
    
    if (logOutput) {
      console.log('Соединение с Supabase успешно установлено');
    }
    
    return true;
  } catch (e) {
    if (logOutput) {
      console.error('Критическая ошибка при проверке соединения с Supabase:', e);
    }
    return false;
  }
};

// Добавляем функцию isSupabaseConnected, которую будем использовать в других модулях
export const isSupabaseConnected = async (logOutput: boolean = false): Promise<boolean> => {
  return await checkSupabaseConnection(logOutput);
};

// Реэкспортируем supabase от integrations для использования в aiService
export { supabase } from "@/integrations/supabase/client";
