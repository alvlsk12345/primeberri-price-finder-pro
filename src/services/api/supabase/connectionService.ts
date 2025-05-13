
import { supabase } from '@/integrations/supabase/client';

// Глобальное состояние соединения
type ConnectionStatus = 'unknown' | 'checking' | 'connected' | 'disconnected';

interface ConnectionState {
  status: ConnectionStatus;
  lastChecked: number;
  isConnected: boolean;
}

// Время жизни кэша увеличено до 10 минут
const CACHE_TTL = 600000; 

// Начальное состояние
let connectionState: ConnectionState = {
  status: 'unknown',
  lastChecked: 0,
  isConnected: false
};

// Список подписчиков на изменение состояния
type SubscriberCallback = (state: ConnectionState) => void;
const subscribers: SubscriberCallback[] = [];

// Глобальная блокировка параллельных проверок
let isCheckingConnection = false;

/**
 * Подписаться на изменения состояния соединения
 */
export const subscribeToConnectionState = (callback: SubscriberCallback): () => void => {
  subscribers.push(callback);
  
  // Сразу оповещаем о текущем состоянии
  callback(connectionState);
  
  // Возвращаем функцию отписки
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};

/**
 * Обновить всех подписчиков
 */
const notifySubscribers = () => {
  subscribers.forEach(callback => callback(connectionState));
};

/**
 * Получить текущее состояние соединения без проверки
 */
export const getConnectionState = (): ConnectionState => {
  return { ...connectionState };
};

/**
 * Проверка доступности Supabase с оптимизированным кэшированием
 */
export const checkSupabaseConnection = async (forceCheck: boolean = false): Promise<boolean> => {
  // Если кэш валидный и не требуется принудительная проверка, используем его
  if (!forceCheck && 
      connectionState.status !== 'unknown' && 
      (Date.now() - connectionState.lastChecked < CACHE_TTL)) {
    console.debug('Используем кэшированный статус подключения к Supabase:', connectionState.isConnected);
    return connectionState.isConnected;
  }
  
  // Если проверка уже выполняется, возвращаем текущее состояние
  if (isCheckingConnection) {
    console.debug('Проверка подключения уже выполняется, ожидаем завершения...');
    return connectionState.isConnected;
  }
  
  // Устанавливаем статус проверки
  isCheckingConnection = true;
  connectionState.status = 'checking';
  notifySubscribers();
  
  try {
    console.debug('Проверка подключения к Supabase начата...');
    
    // Проверка соединения через вызов тестовой функции
    const testConnection = await supabase.functions.invoke('ai-proxy', {
      body: { testConnection: true }
    });
    
    const isConnected = !testConnection.error && testConnection.data !== null;
    
    // Обновляем состояние
    connectionState = {
      status: isConnected ? 'connected' : 'disconnected',
      lastChecked: Date.now(),
      isConnected
    };
    
    console.debug('Проверка подключения к Supabase завершена:', isConnected ? 'Успешно' : 'Не удалось');
    
    // Оповещаем подписчиков о новом состоянии
    notifySubscribers();
    
    return isConnected;
  } catch (e) {
    console.error('Ошибка при проверке соединения с Supabase:', e);
    
    // Обновляем состояние при ошибке
    connectionState = {
      status: 'disconnected',
      lastChecked: Date.now(),
      isConnected: false
    };
    
    // Оповещаем подписчиков
    notifySubscribers();
    
    return false;
  } finally {
    // Сбрасываем флаг проверки
    isCheckingConnection = false;
  }
};

/**
 * Инициализация сервиса при загрузке приложения
 * Выполняем первую проверку с задержкой, чтобы не блокировать рендеринг
 */
export const initConnectionService = (): void => {
  setTimeout(() => {
    checkSupabaseConnection();
  }, 1500);
};
