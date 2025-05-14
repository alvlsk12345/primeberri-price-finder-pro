
// Реэкспортируем все необходимые функции и константы
export { getApiKey, ZYLALABS_API_KEY, resetApiKey } from './config';
export { makeZylalabsApiRequest } from './apiClient';
export { buildZylalabsUrl } from './urlBuilder';
export { getCachedResponse, setCacheResponse } from './cacheService';

// Добавляем константы для идентификации API
export const ZYLALABS_API_VERSION = '1.2.0';
export const ZYLALABS_API_ENDPOINT = 'https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products';

// Экспортируем информацию о поддерживаемых странах
export const SUPPORTED_COUNTRIES = [
  'us', 'uk', 'ar', 'in', 'ai', 'au', 'gb', 'bm', 'br', 'io', 'ca', 'ky', 
  'cl', 'cx', 'cc', 'co', 'fk', 'hk', 'hm', 'il', 'jp', 'id', 'kr', 'my', 
  'ms', 'mx', 'nz', 'nf', 'ph', 'ru', 'sa', 'sg', 'gs', 'za', 'ch', 'tk', 
  'tw', 'th', 'tc', 'tr', 'ae', 'ua', 'vg', 'vn', 'de', 'fr', 'es', 'it', 'nl'
];
