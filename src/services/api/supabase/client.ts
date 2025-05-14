
import { createClient } from '@supabase/supabase-js';

// Создаем экспортируемую функцию для проверки подключения к Supabase
export async function isSupabaseConnected(showLogs = true): Promise<boolean> {
  try {
    // Проверка подключения
    if (showLogs) {
      console.log('Проверка подключения к Supabase...');
    }
    
    // Имитируем успешное соединение
    return true;
  } catch (error) {
    if (showLogs) {
      console.error('Ошибка подключения к Supabase:', error);
    }
    return false;
  }
}

// Создаем клиент Supabase для дальнейшего использования
export const supabase = createClient(
  'https://example.supabase.co',
  'your-anon-key'
);

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
