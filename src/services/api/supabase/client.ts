
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection, getConnectionState } from './connectionService';

// Реэкспортируем централизованные функции для проверки соединения
export { checkSupabaseConnection, getConnectionState } from './connectionService';

// Функция для получения статуса подключения Supabase
export async function isSupabaseConnected(): Promise<boolean> {
  // Используем централизованный механизм проверки
  return checkSupabaseConnection(false);
}
