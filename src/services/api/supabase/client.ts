
import { supabase as integrationSupabase } from '@/integrations/supabase/client';
import { getRouteInfo } from '@/utils/navigation';

// Переиспользуем клиент из интеграции Supabase
export const supabase = integrationSupabase;

// Глобальный объект для отслеживания состояния подключения
const connectionState = {
  isConnected: null as boolean | null,
  timestamp: 0,
  inProgress: false, // Защита от параллельных проверок
  lastError: null as Error | null
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
  console.log(`[supabase/client] Вызов isSupabaseConnected(showLogs=${showLogs}, forceCheck=${forceCheck})`);
  
  // Проверяем, активна ли страница настроек (для предотвращения ненужных запросов)
  const routeInfo = getRouteInfo();
  console.log(`[supabase/client] Текущий маршрут: ${JSON.stringify(routeInfo)}`);
  
  // Блокируем проверки на странице настроек если явно не запросили проверку
  if (routeInfo.isSettings && !forceCheck) {
    if (showLogs) {
      console.log('[supabase/client] Пропускаем проверку соединения на странице настроек');
    }
    // На странице настроек по умолчанию считаем, что соединение есть
    // для предотвращения ошибок UI
    return true;
  }
  
  // Используем кеш, если он еще действителен и не требуется принудительная проверка
  const now = Date.now();
  if (!forceCheck && connectionState.isConnected !== null && (now - connectionState.timestamp < CACHE_TTL)) {
    if (showLogs) {
      console.log('[supabase/client] Использую кешированный результат проверки соединения:', connectionState.isConnected);
    }
    return connectionState.isConnected;
  }
  
  // Предотвращаем параллельные проверки соединения
  if (connectionState.inProgress) {
    if (showLogs) {
      console.log('[supabase/client] Проверка соединения уже выполняется, ожидаем...');
    }
    
    // Ждем завершения текущей проверки
    let retries = 0;
    while (connectionState.inProgress && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    // Если после ожидания результат есть в кеше, используем его
    if (connectionState.isConnected !== null && (Date.now() - connectionState.timestamp < CACHE_TTL)) {
      return connectionState.isConnected;
    }
  }
  
  // Устанавливаем флаг проверки
  connectionState.inProgress = true;
  
  try {
    if (showLogs) {
      console.log('[supabase/client] Проверка подключения к Supabase...');
    }
    
    // Используем надежный метод для проверки подключения - проверку сессии
    const { data, error } = await supabase.auth.getSession();
    
    // Если нет ошибки, считаем что соединение установлено
    // Даже если сессия не активна (data.session === null), соединение считается рабочим
    const isConnected = !error;
    
    // Обновляем кеш
    connectionState.isConnected = isConnected;
    connectionState.timestamp = now;
    connectionState.lastError = error;
    
    if (showLogs) {
      if (isConnected) {
        console.log('[supabase/client] Соединение с Supabase установлено успешно');
      } else {
        console.error('[supabase/client] Ошибка соединения с Supabase:', error);
      }
    }
    
    return isConnected;
  } catch (error) {
    if (showLogs) {
      console.error('[supabase/client] Ошибка при проверке подключения к Supabase:', error);
    }
    
    // В случае ошибки обновляем кеш с отрицательным результатом
    connectionState.isConnected = false;
    connectionState.timestamp = now;
    connectionState.lastError = error as Error;
    
    return false;
  } finally {
    // Снимаем флаг проверки
    connectionState.inProgress = false;
  }
}

/**
 * Функция для проверки соединения, экспортируемая отдельно для удобства
 * @param forceCheck Игнорировать кеш и выполнить принудительную проверку
 */
export function checkSupabaseConnection(forceCheck = false) {
  console.log(`[supabase/client] Вызов checkSupabaseConnection(forceCheck=${forceCheck})`);
  return isSupabaseConnected(true, forceCheck);
}

/**
 * Удаляет кешированный результат проверки соединения
 */
export function clearConnectionCache() {
  connectionState.isConnected = null;
  connectionState.timestamp = 0;
  console.log('[supabase/client] Кеш проверки соединения очищен');
}

// Сбрасываем кеш при изменении статуса сети
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[supabase/client] Сеть снова онлайн, сбрасываем кеш состояния подключения');
    connectionState.isConnected = null;
  });
  
  window.addEventListener('offline', () => {
    console.log('[supabase/client] Сеть офлайн, устанавливаем состояние подключения в false');
    connectionState.isConnected = false;
    connectionState.timestamp = Date.now();
  });
}

// Экспортируем функции по умолчанию
export default {
  isSupabaseConnected,
  supabase,
  checkSupabaseConnection,
  clearConnectionCache
};
