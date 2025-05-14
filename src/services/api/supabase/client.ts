

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
    
    // Используем простой запрос к системной таблице pg_stat_database, 
    // который должен работать во всех случаях
    const { data, error } = await supabase
      .from('_fake_table_for_connection_test_only')
      .select('*')
      .limit(1)
      .single();
      
    // Успешное соединение будет, если ошибка связана с отсутствием таблицы,
    // а не с проблемой соединения
    const isConnected = error && error.code === 'PGRST116';
    
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

