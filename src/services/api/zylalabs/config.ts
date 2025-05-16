
import { supabase } from '@/integrations/supabase/client';

/**
 * Имя API ключа в local storage
 */
export const ZYLALABS_API_KEY = 'zylalabs-api-key';

/**
 * Базовый URL для API запросов
 */
export const BASE_URL = 'https://api.zylalabs.com/api/2033/real+time+product+search+api/1809/search+products';

/**
 * Таймаут для запросов в миллисекундах (30 секунд)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Получает API ключ сначала из Supabase, затем из localStorage если не найден
 * @returns API ключ или пустую строку
 */
export const getApiKey = async (): Promise<string> => {
  try {
    // Пробуем получить ключ из Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('api-key-manager', {
      body: { action: 'get', key: ZYLALABS_API_KEY }
    });

    if (!error && data && data.value) {
      console.log('API ключ получен из Supabase');
      return data.value;
    }
    
    // Если не удалось получить из Supabase или произошла ошибка, используем localStorage
    console.log('Используем API ключ из localStorage');
    return localStorage.getItem(ZYLALABS_API_KEY) || '';
  } catch (e) {
    console.error('Ошибка при получении API ключа:', e);
    
    // В случае ошибки, пробуем использовать localStorage
    return localStorage.getItem(ZYLALABS_API_KEY) || '';
  }
};

/**
 * Сохраняет API ключ в Supabase и в localStorage как резервный вариант
 * @param apiKey API ключ для сохранения
 * @returns true если успешно сохранен
 */
export const setApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Сохраняем ключ в Supabase
    const { error } = await supabase.functions.invoke('api-key-manager', {
      body: { action: 'set', key: ZYLALABS_API_KEY, value: apiKey }
    });
    
    if (error) {
      console.error('Ошибка при сохранении ключа в Supabase:', error);
      // Если ошибка в Supabase, все равно сохраняем в localStorage
    }
    
    // Всегда сохраняем в localStorage как резервный вариант
    localStorage.setItem(ZYLALABS_API_KEY, apiKey);
    return true;
  } catch (e) {
    console.error('Ошибка при установке API ключа:', e);
    
    // В случае ошибки, пробуем использовать localStorage
    try {
      localStorage.setItem(ZYLALABS_API_KEY, apiKey);
      return true;
    } catch {
      return false;
    }
  }
};
