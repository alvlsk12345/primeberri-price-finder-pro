
import { createClient } from '@supabase/supabase-js';

// Создаем клиент Supabase с переменными среды
// Эти переменные должны быть заданы после подключения Supabase к проекту
const supabaseUrl = "https://juacmpkewomkducoanle.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWNtcGtld29ta2R1Y29hbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTUwNDQsImV4cCI6MjA2MjUzMTA0NH0.UMkGF_zp-aAI9F71bOCuGzr3zRbusECclCyQUJAdrqk";

// Проверяем наличие ключей Supabase
const hasSupabaseConfig = supabaseUrl && supabaseKey;

// Создаем клиент, если есть конфигурация
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Удаляем кеш, теперь проверка будет выполняться только при явном вызове

// Функция для проверки доступности Supabase
export const isSupabaseConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.log('Клиент Supabase не инициализирован');
    return false;
  }
  
  try {
    // Простой запрос для проверки соединения - вызов функции ai-proxy
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { testConnection: true }
    });
    
    const isConnected = !error && data !== null;
    
    console.log('Проверка подключения к Supabase:', isConnected ? 'Успешно' : 'Не удалось');
    return isConnected;
  } catch (e) {
    console.error('Ошибка при проверке соединения с Supabase:', e);
    return false;
  }
};

// Функция для получения статуса подключения Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  return isSupabaseConnected();
}
