
import { createClient } from '@supabase/supabase-js';

// Создаем клиент Supabase с переменными среды
// Эти переменные должны быть заданы после подключения Supabase к проекту
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Проверяем наличие ключей Supabase
const hasSupabaseConfig = supabaseUrl && supabaseKey;

// Создаем клиент, если есть конфигурация
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Функция для проверки доступности Supabase
export const isSupabaseConnected = (): boolean => {
  return !!supabase;
};

// Функция для получения статуса подключения Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    // Простой запрос для проверки соединения
    const { error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    // Если ошибка связана с отсутствием таблицы, но не с соединением - считаем что соединение есть
    if (error && error.code === '42P01') { // код ошибки "отношение не существует"
      return true;
    }
    
    return !error;
  } catch (e) {
    console.error('Ошибка при проверке соединения с Supabase:', e);
    return false;
  }
}
