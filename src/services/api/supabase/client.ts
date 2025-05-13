
import { supabase } from '@/integrations/supabase/client';

/**
 * Проверяет соединение с Supabase
 * @returns true если соединение установлено, иначе false
 */
export async function isSupabaseConnected(): Promise<boolean> {
  try {
    // Пытаемся выполнить простой запрос для проверки соединения
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1).maybeSingle();
    
    // Даже если ошибка 400 (отсутствие таблицы), мы считаем соединение установленным
    // 400 - значит, что сервер ответил и аутентификация прошла, но таблица не существует
    if (error) {
      if (error.code === '42P01' || error.code.startsWith('4')) {
        return true;
      }
      
      console.warn('Ошибка при проверке соединения с Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при проверке соединения с Supabase:', error);
    return false;
  }
}

export { supabase };
