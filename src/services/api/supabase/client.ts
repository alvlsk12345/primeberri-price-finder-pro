
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Переиспользуем клиент из интеграции Supabase
export const supabase = integrationSupabase;

// Кеш результата проверки соединения для уменьшения количества запросов
let connectionCache: { isConnected: boolean | null; timestamp: number } = {
  isConnected: null,
  timestamp: 0
};

// Время жизни кеша (10 секунд)
const CACHE_TTL = 10 * 1000;

/**
 * Проверяет соединение с Supabase с использованием оптимизированного подхода
 * @param showLogs Включить вывод сообщений в консоль
 * @param forceCheck Игнорировать кеш и выполнить принудительную проверку
 * @returns Статус подключения (true - подключено, false - нет соединения)
 */
export async function isSupabaseConnected(showLogs = true, forceCheck = false): Promise<boolean> {
  // Проверяем, активна ли страница настроек (для предотвращения ненужных запросов)
  const bodyDataPath = document.body.getAttribute('data-path');
  const isSettings = bodyDataPath === '/settings' || window.location.hash === '#/settings';
  
  // Используем кеш, если он еще действителен и не требуется принудительная проверка
  const now = Date.now();
  if (!forceCheck && connectionCache.isConnected !== null && (now - connectionCache.timestamp < CACHE_TTL)) {
    if (showLogs) {
      console.log('Использую кешированный результат проверки соединения:', connectionCache.isConnected);
    }
    return connectionCache.isConnected;
  }

  try {
    if (showLogs) {
      console.log('Проверка подключения к Supabase...');
    }
    
    // Используем надежный метод для проверки подключения - проверку сессии
    const { data, error } = await supabase.auth.getSession();
    
    // Если нет ошибки, считаем что соединение установлено
    // Даже если сессия не активна (data.session === null), соединение считается рабочим
    const isConnected = !error;
    
    // Обновляем кеш
    connectionCache = { isConnected, timestamp: now };
    
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
    
    // В случае ошибки обновляем кеш с отрицательным результатом
    connectionCache = { isConnected: false, timestamp: now };
    return false;
  }
}

/**
 * Функция для проверки соединения, экспортируемая отдельно для удобства
 * @param forceCheck Игнорировать кеш и выполнить принудительную проверку
 */
export function checkSupabaseConnection(forceCheck = false) {
  return isSupabaseConnected(true, forceCheck);
}

// Сбрасываем кеш при изменении статуса сети
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    connectionCache.isConnected = null;
  });
}

// Экспортируем функции по умолчанию
export default {
  isSupabaseConnected,
  supabase,
  checkSupabaseConnection
};
