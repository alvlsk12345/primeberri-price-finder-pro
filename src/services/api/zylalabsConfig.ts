
// Этот файл оставлен для обратной совместимости
// Он реэкспортирует все функции из новых модулей

import { getApiKey, ZYLALABS_API_KEY } from './zylalabs/config';
import { makeZylalabsApiRequest } from './zylalabs/apiClient';
import { buildUrl } from './zylalabs/urlBuilder';

// Реэкспорт функций для обратной совместимости
export { getApiKey, ZYLALABS_API_KEY, makeZylalabsApiRequest };
export const buildZylalabsUrl = buildUrl; // Добавляем алиас для buildZylalabsUrl
