
/**
 * Суффикс для определения проксированных URL, чтобы избежать повторного проксирования
 */
const PROXY_SUFFIX = '&proxied=true';

/**
 * Список доменов, которые требуют прокси из-за CORS-ограничений
 */
const CORS_PROBLEM_DOMAINS = [
  'encrypted-tbn',
  'googleusercontent.com',
  'gstatic.com',
  'ggpht.com',
  'zylalabs.com',
  'promptapi.com',
  'api.promptapi.com',
  'api.eu-central.promptapi.com'
];

/**
 * Проверяет, нуждается ли URL в проксировании для обхода CORS-ограничений
 */
export const needsProxying = (url: string): boolean => {
  if (!url) return false;
  
  // Если URL уже проксирован, не проксируем повторно
  if (isProxiedUrl(url)) return false;
  
  // Не проксируем data URLs
  if (url.startsWith('data:')) return false;
  
  // Не проксируем изображения из Supabase Storage, которые уже кэшированы
  if (url.includes('juacmpkewomkducoanle.supabase.co/storage/v1/object/public/product-images')) {
    return false;
  }
  
  // Проверяем, содержит ли URL один из проблемных доменов
  return CORS_PROBLEM_DOMAINS.some(domain => url.includes(domain));
};

/**
 * Создает URL для проксированного изображения с улучшенными параметрами
 * @param url Оригинальный URL изображения
 * @param directFetch Флаг для прямой загрузки без кэширования
 * @param forceProxy Принудительное использование прокси даже если needsProxying возвращает false
 * @returns URL к прокси-эндпоинту с оригинальным URL в качестве параметра
 */
export const getProxiedImageUrl = (
  url: string, 
  directFetch: boolean = false,
  forceProxy: boolean = false
): string => {
  if (!url) return '';
  
  // Проверка необходимости проксирования
  if (!forceProxy && !needsProxying(url)) return url;
  
  // Если URL уже проксирован, не добавляем прокси повторно
  if (isProxiedUrl(url)) return url;
  
  try {
    // Кодируем URL для безопасной передачи в качестве параметра
    const encodedUrl = encodeURIComponent(url);
    
    // Для Zylalabs изображений и Google Thumbnails всегда используем directFetch и forceDirectFetch
    const isZylalabs = url.includes('zylalabs.com') || url.includes('promptapi.com');
    const isGoogleThumb = url.includes('encrypted-tbn');
    const shouldBypassCache = directFetch || isZylalabs || isGoogleThumb;
    const shouldForceDirectFetch = isZylalabs; // Принудительная прямая загрузка для Zylalabs
    
    // Конструируем URL к Edge Function с кэшированием изображений
    let proxyUrl = `https://juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy?url=${encodedUrl}${PROXY_SUFFIX}`;
    
    // Добавляем параметр для обхода кэша, если запрошено
    if (shouldBypassCache) {
      proxyUrl += '&bypassCache=true';
    }
    
    // Добавляем параметр forceDirectFetch для Zylalabs
    if (shouldForceDirectFetch) {
      proxyUrl += '&forceDirectFetch=true';
    }
    
    // Добавляем уникальный timestamp для предотвращения кэширования браузером
    proxyUrl += `&t=${Date.now()}`;
    
    return proxyUrl;
  } catch (error) {
    console.error('Ошибка создания прокси-URL:', error);
    return url; // В случае ошибки возвращаем оригинальный URL
  }
};

/**
 * Проверяет, является ли URL проксированным
 */
export const isProxiedUrl = (url: string): boolean => {
  return url ? url.includes(PROXY_SUFFIX) || url.includes('/functions/v1/image-proxy') : false;
};

/**
 * Извлекает оригинальный URL из проксированного URL
 */
export const extractOriginalUrlFromProxied = (proxyUrl: string): string | null => {
  if (!proxyUrl || !isProxiedUrl(proxyUrl)) return null;
  
  try {
    const url = new URL(proxyUrl);
    const originalUrl = url.searchParams.get('url');
    return originalUrl ? decodeURIComponent(originalUrl).replace(PROXY_SUFFIX, '') : null;
  } catch (error) {
    console.error('Ошибка извлечения оригинального URL из прокси:', error);
    return null;
  }
};

/**
 * Извлекает параметр из URL по имени
 */
export const getUrlParam = (url: string, paramName: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(paramName);
  } catch (error) {
    // Для неполных URL, пытаемся найти параметр вручную
    const regex = new RegExp(`[?&]${paramName}=([^&#]*)`, 'i');
    const result = regex.exec(url);
    return result ? decodeURIComponent(result[1]) : null;
  }
};
