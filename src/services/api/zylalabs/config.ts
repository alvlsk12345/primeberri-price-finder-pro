
/**
 * Имя API ключа в local storage
 */
export const ZYLALABS_API_KEY = 'zylalabs-api-key';

/**
 * Базовый URL для API запросов
 * Используем правильный домен и формат URL с плюсами вместо дефисов согласно документации
 */
export const BASE_URL = 'https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products';

/**
 * Таймаут для запросов в миллисекундах (30 секунд)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Импорт функций из универсального сервиса управления API ключами
 */
import { getApiKey as getApiKeyGeneric, setApiKey as setApiKeyGeneric } from '../apiKeyService';

/**
 * URL для Edge Function управления API ключами
 */
export const API_KEY_MANAGER_URL = 'https://juacmpkewomkducoanle.supabase.co/functions/v1/api-key-manager';

/**
 * Получает API ключ Zylalabs
 * @returns API ключ или пустую строку
 */
export const getApiKey = async (): Promise<string> => {
  return getApiKeyGeneric('zylalabs');
};

/**
 * Сохраняет API ключ Zylalabs
 * @param apiKey API ключ для сохранения
 * @returns true если успешно сохранен
 */
export const setApiKey = async (apiKey: string): Promise<boolean> => {
  return setApiKeyGeneric('zylalabs', apiKey);
};
