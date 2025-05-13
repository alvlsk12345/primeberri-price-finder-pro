
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Увеличиваем время жизни кэша до 5 минут для снижения количества проверок
const CACHE_TTL = 300000; // 5 минут

// Кэш для результата проверки соединения
let connectionCache: { isConnected: boolean, timestamp: number } | null = null;

// Глобальный флаг проверки подключения
let isCheckingConnection = false;

// Функция для проверки доступности Supabase с оптимизированным кэшированием
export const isSupabaseConnected = async (): Promise<boolean> => {
  // Если кэш валидный, используем его без дополнительных проверок
  if (connectionCache && (Date.now() - connectionCache.timestamp < CACHE_TTL)) {
    console.debug('Используем кэшированный статус подключения к Supabase:', connectionCache.isConnected);
    return connectionCache.isConnected;
  }
  
  // Если проверка уже выполняется, ожидаем ее завершения
  if (isCheckingConnection) {
    console.debug('Проверка подключения уже выполняется, ожидаем результат...');
    // Ждем небольшую задержку и повторно проверяем кэш
    await new Promise(resolve => setTimeout(resolve, 500));
    if (connectionCache && (Date.now() - connectionCache.timestamp < CACHE_TTL)) {
      return connectionCache.isConnected;
    }
  }
  
  // Устанавливаем флаг, что проверка выполняется
  isCheckingConnection = true;
  
  try {
    console.debug('Проверка подключения к Supabase начата...');
    
    // Используем только один метод проверки для сокращения запросов
    const testConnection = await supabase.functions.invoke('ai-proxy', {
      body: { testConnection: true }
    });
    
    const isConnected = !testConnection.error && testConnection.data !== null;
    
    // Кэшируем результат
    connectionCache = { isConnected, timestamp: Date.now() };
    
    console.debug('Проверка подключения к Supabase завершена:', isConnected ? 'Успешно' : 'Не удалось');
    return isConnected;
  } catch (e) {
    console.error('Ошибка при проверке соединения с Supabase:', e);
    connectionCache = { isConnected: false, timestamp: Date.now() };
    return false;
  } finally {
    // Сбрасываем флаг проверки
    isCheckingConnection = false;
  }
};

// Функция для получения статуса подключения Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  // Очищаем кэш только при явном вызове проверки
  connectionCache = null;
  console.log('Принудительная проверка подключения к Supabase...');
  return isSupabaseConnected();
}
