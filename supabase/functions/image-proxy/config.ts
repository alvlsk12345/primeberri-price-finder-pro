
// Конфигурационные константы для Image Proxy Edge Function

// CORS заголовки для всех ответов
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Время кэширования изображений в секундах (7 дней)
export const CACHE_TIME = 7 * 24 * 60 * 60;

// Суффикс для определения проксированных URL
export const PROXY_SUFFIX = '&proxied=true';

// Расширенные заголовки запроса для улучшенной совместимости
export const ENHANCED_REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.google.com/'
};

// Таймаут для запросов изображений (в миллисекундах)
export const REQUEST_TIMEOUT = 15000;

// Заголовки для запросов к Zylalabs
export const ZYLALABS_REQUEST_HEADERS = {
  ...ENHANCED_REQUEST_HEADERS,
  'Origin': 'https://zylalabs.com',
  'Referer': 'https://zylalabs.com/',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site'
};

// Заголовки для запросов к Google изображениям
export const GOOGLE_REQUEST_HEADERS = {
  ...ENHANCED_REQUEST_HEADERS,
  'Referer': 'https://www.google.com/',
  'Origin': 'https://www.google.com'
};

// Заголовки для запросов к миниатюрам Google (encrypted-tbn)
export const GOOGLE_THUMBNAIL_REQUEST_HEADERS = {
  ...GOOGLE_REQUEST_HEADERS,
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// Конфигурация для Supabase Storage бакета
export const STORAGE_CONFIG = {
  BUCKET_ID: 'product-images',
  CACHE_PREFIX: 'cached-',
  MAX_CACHE_SIZE: 500 * 1024 * 1024, // 500 МБ максимальный размер файла для кэширования
};

// Список доменов, для которых требуется специальная обработка
export const SPECIAL_DOMAINS = {
  google: [
    'googleusercontent.com',
    'gstatic.com',
    'ggpht.com',
    'encrypted-tbn'
  ],
  zylalabs: [
    'zylalabs.com',
    'promptapi.com',
    'zyla-api',
    'zylahome'
  ]
};

// Функция для определения типа источника изображения
export const detectImageSource = (url: string): ImageSource => {
  if (!url) return 'unknown';
  
  // Проверяем Zylalabs домены
  for (const domain of SPECIAL_DOMAINS.zylalabs) {
    if (url.includes(domain)) return 'zylalabs';
  }
  
  // Проверяем Google домены
  for (const domain of SPECIAL_DOMAINS.google) {
    if (url.includes(domain)) return 'google';
  }
  
  return 'standard';
};

// Функция для выбора заголовков в зависимости от источника
export const getRequestHeadersForSource = (url: string): Record<string, string> => {
  const source = detectImageSource(url);
  
  if (source === 'zylalabs') {
    return ZYLALABS_REQUEST_HEADERS;
  } else if (source === 'google') {
    // Для Google Encrypted Thumbnails используем специальные заголовки
    return url.includes('encrypted-tbn') 
      ? GOOGLE_THUMBNAIL_REQUEST_HEADERS 
      : GOOGLE_REQUEST_HEADERS;
  }
  
  return ENHANCED_REQUEST_HEADERS;
};

