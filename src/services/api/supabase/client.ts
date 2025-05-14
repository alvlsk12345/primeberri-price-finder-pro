
import { supabase as integrationSupabase } from '@/integrations/supabase/client';
import { getRouteInfo } from '@/utils/navigation';

// Переиспользуем клиент из интеграции Supabase
export const supabase = integrationSupabase;

// Глобальный объект для отслеживания состояния подключения
const connectionState = {
  isConnected: null as boolean | null,
  timestamp: 0,
  inProgress: false, // Защита от параллельных проверок
  lastError: null as Error | null,
  lastClearTime: 0, // Время последней очистки кеша
  clearAttempts: 0, // Счетчик попыток очистки
  navigationInProgress: false, // Флаг для предотвращения очистки во время навигации
  lastNavigationEvent: 0 // Время последнего события навигации
};

// Время жизни кеша (10 секунд)
const CACHE_TTL = 10 * 1000;

// Минимальный интервал между очистками кеша (миллисекунды)
const MIN_CLEAR_INTERVAL = 3000;

// Минимальное время после навигации, когда разрешена очистка кеша
const NAVIGATION_COOLDOWN = 2500; // Увеличиваем время запрета очистки после навигации

/**
 * Проверяет, находимся ли мы в процессе навигации
 * @returns true если навигация в процессе, false в противном случае
 */
function isNavigating(): boolean {
  const now = Date.now();
  
  // Если с момента последнего события навигации прошло меньше NAVIGATION_COOLDOWN,
  // считаем, что мы всё ещё в процессе навигации
  if (now - connectionState.lastNavigationEvent < NAVIGATION_COOLDOWN) {
    console.log('[supabase/client] Все еще в периоде остывания после навигации:', 
                now - connectionState.lastNavigationEvent, 'мс назад');
    return true;
  }
  
  return connectionState.navigationInProgress;
}

/**
 * Проверяет, находимся ли мы на странице настроек
 * Используем несколько методов для определения, с высоким приоритетом проверки класса
 */
function isOnSettingsPage(): boolean {
  // Наивысший приоритет - проверка класса settings-page
  if (document.body.classList.contains('settings-page')) {
    console.log('[supabase/client] На странице настроек (определено по классу body)');
    return true;
  }
  
  // Хеш-проверка (для HashRouter)
  if (window.location.hash === '#/settings') {
    console.log('[supabase/client] На странице настроек (определено по хешу)');
    return true;
  }
  
  // Проверка через data-path атрибут
  if (document.body.getAttribute('data-path') === '/settings') {
    console.log('[supabase/client] На странице настроек (определено по data-path)');
    return true;
  }
  
  const routeInfo = getRouteInfo();
  const result = routeInfo.isSettings;
  
  if (result) {
    console.log('[supabase/client] На странице настроек (определено через getRouteInfo)');
  } else {
    console.log('[supabase/client] Не на странице настроек');
  }
  
  return result;
}

/**
 * Отмечает начало навигации
 */
function startNavigation() {
  console.log('[supabase/client] Зарегистрировано начало навигации');
  connectionState.navigationInProgress = true;
  connectionState.lastNavigationEvent = Date.now();
  console.log('[supabase/client] Началась навигация, очистка кеша заблокирована');
}

/**
 * Отмечает завершение навигации
 */
function endNavigation() {
  console.log('[supabase/client] Зарегистрировано завершение навигации');
  connectionState.navigationInProgress = false;
  connectionState.lastNavigationEvent = Date.now();
  console.log('[supabase/client] Навигация завершена, очистка кеша будет разблокирована через '
   + NAVIGATION_COOLDOWN + 'мс');
}

/**
 * Проверяет соединение с Supabase с использованием оптимизированного подхода
 * @param showLogs Включить вывод сообщений в консоль
 * @param forceCheck Игнорировать кеш и выполнить принудительную проверку
 * @returns Статус подключения (true - подключено, false - нет соединения)
 */
export async function isSupabaseConnected(showLogs = true, forceCheck = false): Promise<boolean> {
  if (showLogs) {
    console.log(`[supabase/client] Вызов isSupabaseConnected(showLogs=${showLogs}, forceCheck=${forceCheck})`);
  }
  
  // Проверяем, активна ли страница настроек (для предотвращения ненужных запросов)
  const onSettingsPage = isOnSettingsPage();
  
  if (showLogs && onSettingsPage) {
    console.log('[supabase/client] Определено, что мы на странице настроек');
  }
  
  // Блокируем проверки на странице настроек если явно не запросили проверку
  if (onSettingsPage && !forceCheck) {
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
    
    // Проверяем еще раз, что мы не в процессе навигации и не на странице настроек
    if (isNavigating() && !forceCheck) {
      console.log('[supabase/client] В процессе навигации, возвращаем последний известный результат или true');
      connectionState.inProgress = false;
      return connectionState.isConnected !== null ? connectionState.isConnected : true;
    }
    
    if (isOnSettingsPage() && !forceCheck) {
      console.log('[supabase/client] На странице настроек, пропускаем проверку');
      connectionState.inProgress = false;
      return true;
    }
    
    // Используем надежный метод для проверки подключения - проверку сессии
    const { data, error } = await supabase.auth.getSession();
    
    // Если нет ошибки, считаем что соединение установлено
    // Даже если сессия не активна (data.session === null), соединение считается рабочим
    const isConnected = !error;
    
    // Обновляем кеш, только если мы не на странице настроек или явно запросили проверку
    if (!isOnSettingsPage() || forceCheck) {
      connectionState.isConnected = isConnected;
      connectionState.timestamp = now;
      connectionState.lastError = error;
    }
    
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
    // только если мы не на странице настроек или явно запросили проверку
    if (!isOnSettingsPage() || forceCheck) {
      connectionState.isConnected = false;
      connectionState.timestamp = now;
      connectionState.lastError = error as Error;
    }
    
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
 * Улучшенная версия с защитой от слишком частого вызова и проверкой маршрута
 */
export function clearConnectionCache() {
  const now = Date.now();
  console.log(`[supabase/client] Попытка очистки кеша соединения в ${new Date(now).toISOString()}`);
  
  // Защитный механизм #1: проверяем, что мы не на странице настроек
  const onSettingsPage = isOnSettingsPage();
  if (onSettingsPage) {
    console.log('[supabase/client] Попытка очистки кеша на странице настроек ОТКЛОНЕНА');
    return; // Предотвращаем очистку кеша на странице настроек
  }
  
  // Защитный механизм #2: проверяем, не происходит ли навигация
  if (isNavigating()) {
    console.log('[supabase/client] Попытка очистки кеша во время навигации ОТКЛОНЕНА');
    return; // Предотвращаем очистку кеша во время навигации
  }
  
  // Защитный механизм #3: ограничиваем частоту очистки кеша
  if (now - connectionState.lastClearTime < MIN_CLEAR_INTERVAL) {
    connectionState.clearAttempts++;
    console.log(`[supabase/client] Слишком частые попытки очистить кеш (${connectionState.clearAttempts}), ОТКЛОНЕНО`);
    
    // Если попыток слишком много, логируем предупреждение
    if (connectionState.clearAttempts > 5) {
      console.warn('[supabase/client] Обнаружено множественное обращение к clearConnectionCache, возможно циклический вызов');
    }
    return;
  }
  
  // Все проверки пройдены, очищаем кеш состояния
  connectionState.isConnected = null;
  connectionState.timestamp = 0;
  connectionState.lastClearTime = now;
  connectionState.clearAttempts = 0;
  
  console.log('[supabase/client] Кеш проверки соединения успешно очищен');
}

// Отслеживаем изменения в URL для предотвращения очистки кеша во время навигации
if (typeof window !== 'undefined') {
  // Отслеживаем навигационные события
  ['popstate', 'hashchange'].forEach(event => {
    window.addEventListener(event, () => {
      console.log(`[supabase/client] Обнаружено событие ${event}, запускаем обработку навигации`);
      startNavigation();
      
      // Устанавливаем таймер для завершения навигации
      setTimeout(() => {
        endNavigation();
      }, NAVIGATION_COOLDOWN);
    });
  });
  
  // Сбрасываем кеш при изменении статуса сети
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
