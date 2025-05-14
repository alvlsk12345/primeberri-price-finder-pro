
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
    
    // Простой запрос для проверки соединения
    const { error } = await supabase.from('_dummy_query_for_connection_test')
      .select('*')
      .limit(1)
      .catch(() => ({ error: new Error('Ошибка соединения') }));
    
    // Даже если таблицы не существует, соединение работает, если ошибка связана с отсутствием таблицы
    const isConnected = !error || error.message.includes('does not exist');
    
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
