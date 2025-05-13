
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

// Кэш для результата проверки соединения, чтобы не проверять каждый раз
let connectionCache: { isConnected: boolean, timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 минута

// Функция для проверки доступности Supabase
export const isSupabaseConnected = async (): Promise<boolean> => {
  // Если кэш валидный, используем его
  if (connectionCache && (Date.now() - connectionCache.timestamp < CACHE_TTL)) {
    console.log('Используем кэшированный статус подключения к Supabase:', connectionCache.isConnected);
    return connectionCache.isConnected;
  }
  
  if (!supabase) {
    console.log('Клиент Supabase не инициализирован');
    connectionCache = { isConnected: false, timestamp: Date.now() };
    return false;
  }
  
  try {
    console.log('Проверка подключения к Supabase начата...');
    
    // Используем оба метода для проверки соединения
    // 1. Вызов с body для проверки тестового соединения
    const testConnection = await supabase.functions.invoke('ai-proxy', {
      body: { testConnection: true }
    });
    console.log('Результат проверки POST запросом:', testConnection);
    
    // 2. Простой GET запрос как резервный метод
    let isConnected = !testConnection.error && testConnection.data !== null;
    
    // Если первый метод не сработал, пробуем GET запрос
    if (!isConnected) {
      console.log('POST запрос не удался, пробуем GET...');
      const getRequest = await supabase.functions.invoke('ai-proxy', {
        method: 'GET'
      });
      console.log('Результат проверки GET запросом:', getRequest);
      isConnected = !getRequest.error && getRequest.data !== null;
    }
    
    // Кэшируем результат
    connectionCache = { isConnected, timestamp: Date.now() };
    
    console.log('Проверка подключения к Supabase завершена:', isConnected ? 'Успешно' : 'Не удалось');
    return isConnected;
  } catch (e) {
    console.error('Ошибка при проверке соединения с Supabase:', e);
    connectionCache = { isConnected: false, timestamp: Date.now() };
    return false;
  }
};

// Функция для получения статуса подключения Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  // Очищаем кэш для получения свежего результата
  connectionCache = null;
  console.log('Принудительная проверка подключения к Supabase...');
  return isSupabaseConnected();
}
