
// Этот файл нужно создать, так как он не существует
import { supabase } from '@/integrations/supabase/client';

// Тип состояния соединения
export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

// Интерфейс состояния соединения
interface ConnectionState {
  isConnected: boolean;
  status: ConnectionStatus;
}

// Начальное состояние соединения
const initialState: ConnectionState = {
  isConnected: false,
  status: 'checking'
};

// Текущее состояние соединения
let connectionState = { ...initialState };

// Обработчики для подписки на изменения состояния
const handlers: ((state: ConnectionState) => void)[] = [];

/**
 * Проверяет соединение с Supabase
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    // Если запрос выполнился без ошибок, считаем соединение установленным
    const connected = !error;
    
    // Обновляем состояние
    updateConnectionState({
      isConnected: connected,
      status: connected ? 'connected' : 'disconnected'
    });
    
    return connected;
  } catch (error) {
    console.error('Ошибка при проверке соединения с Supabase:', error);
    
    // Обновляем состояние
    updateConnectionState({
      isConnected: false,
      status: 'disconnected'
    });
    
    return false;
  }
}

/**
 * Обновляет состояние соединения
 */
function updateConnectionState(newState: Partial<ConnectionState>): void {
  connectionState = {
    ...connectionState,
    ...newState
  };
  
  // Уведомляем всех подписчиков
  notifyHandlers();
}

/**
 * Уведомляет всех обработчиков об изменении состояния
 */
function notifyHandlers(): void {
  handlers.forEach(handler => {
    try {
      handler(connectionState);
    } catch (error) {
      console.error('Ошибка в обработчике состояния соединения:', error);
    }
  });
}

/**
 * Подписывается на изменения состояния соединения
 */
export function subscribeToConnectionState(handler: (state: ConnectionState) => void): () => void {
  handlers.push(handler);
  
  // Немедленно вызываем обработчик с текущим состоянием
  handler(connectionState);
  
  // Возвращаем функцию отписки
  return () => {
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  };
}

/**
 * Получает текущее состояние соединения
 */
export function getConnectionState(): ConnectionState {
  return { ...connectionState };
}

/**
 * Инициализирует сервис соединения
 */
export async function initConnectionService(): Promise<void> {
  try {
    // Устанавливаем статус проверки
    updateConnectionState({ status: 'checking' });
    
    // Проверяем соединение
    await checkConnection();
    
    // Устанавливаем интервал для периодической проверки соединения
    setInterval(checkConnection, 60000); // Каждую минуту
  } catch (error) {
    console.error('Ошибка при инициализации сервиса соединения:', error);
    
    // Обновляем состояние
    updateConnectionState({
      isConnected: false,
      status: 'disconnected'
    });
  }
}
