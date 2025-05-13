
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

// Кеширование результата проверки соединения для предотвращения частых запросов
let connectionCache = {
  lastCheck: 0,
  isConnected: false
};

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings");
};

// Функция для проверки доступности Supabase
export const isSupabaseConnected = async (forceCheck = false): Promise<boolean> => {
  // Никогда не запускаем проверки на странице настроек, если это не явный запрос пользователя
  if (isOnSettingsPage() && !forceCheck) {
    // Удаляем лишний вывод в консоль
    return connectionCache.isConnected; // Возвращаем кешированное значение без проверки
  }

  // Если не требуется принудительная проверка и есть кешированный результат не старше 5 минут
  const currentTime = Date.now();
  const cacheExpiration = 5 * 60 * 1000; // 5 минут в миллисекундах
  if (!forceCheck && currentTime - connectionCache.lastCheck < cacheExpiration) {
    // Удаляем лишний вывод в консоль
    return connectionCache.isConnected;
  }

  // Если нет клиента Supabase, сразу возвращаем false
  if (!supabase) {
    // Удаляем лишний вывод в консоль
    connectionCache = { lastCheck: currentTime, isConnected: false };
    return false;
  }
  
  try {
    // Простой запрос для проверки соединения - вызов функции ai-proxy
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { testConnection: true }
    });
    
    const isConnected = !error && data !== null;
    
    // Обновляем кеш состояния соединения
    connectionCache = {
      lastCheck: currentTime,
      isConnected: isConnected
    };
    
    // Убираем лишний вывод в консоль
    return isConnected;
  } catch (e) {
    // Убираем лишний вывод в консоль
    connectionCache = { lastCheck: currentTime, isConnected: false };
    return false;
  }
};

// Функция для получения статуса подключения Supabase (явный вызов)
export async function checkSupabaseConnection(): Promise<boolean> {
  return isSupabaseConnected(true); // Всегда принудительно проверяем соединение
}
