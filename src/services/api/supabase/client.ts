
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Переиспользуем клиент из интеграции Supabase
export const supabase = integrationSupabase;

// Создаем экспортируемую функцию для проверки подключения к Supabase
export async function isSupabaseConnected(showLogs = true): Promise<boolean> {
  try {
    // Проверка подключения с использованием правильного клиента
    if (showLogs) {
      console.log('Проверка подключения к Supabase...');
    }
    
    // Используем более простой и надежный метод для проверки подключения - ping
    // Это обходит проблемы типизации при попытке обращения к несуществующей таблице
    const { error } = await supabase.auth.getSession();
    
    // Если нет ошибки, считаем что соединение установлено
    const isConnected = !error;
    
    if (showLogs) {
      if (isConnected) {
        console.log('Соединение с Supabase установлено успешно');
      } else {
        console.error('Ошибка соединения с Supabase:', error);
      }
    }
    
    return isConnected;
  } catch (error) {
    if (showLogs) {
      console.error('Ошибка при проверке подключения к Supabase:', error);
    }
    return false;
  }
}

// Добавляем функцию для проверки соединения
export function checkSupabaseConnection() {
  return isSupabaseConnected();
}

// Экспортируем функции по умолчанию
export default {
  isSupabaseConnected,
  supabase,
  checkSupabaseConnection
};
