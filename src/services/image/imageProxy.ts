
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
  'ggpht.com'
  // Удалено 'zylalabs.com' из списка проблемных доменов - загружаем напрямую
];

/**
 * Проверяет, нуждается ли URL в проксировании для обхода CORS-ограничений
 */
export const needsProxying = (url: string): boolean => {
  if (!url) return false;
  
  // Если URL уже проксирован, не проксируем повторно
  if (url.includes(PROXY_SUFFIX)) return false;
  
  // Не проксируем data URLs
  if (url.startsWith('data:')) return false;
  
  // Не проксируем изображения из Supabase Storage, которые уже кэшированы
  if (url.includes('juacmpkewomkducoanle.supabase.co/storage/v1/object/public/product-images')) {
    return false;
  }
  
  // Не проксируем изображения Zylalabs - загружаем напрямую
  if (url.includes('zylalabs.com') || 
      url.includes('zyla-api') || 
      url.includes('zylahome') ||
      url.includes('encik.blob.core.windows.net') ||
      url.includes('zdatastore') || 
      url.includes('zyla-pd')) {
    return false;
  }
  
  // Проверяем, содержит ли URL один из проблемных доменов
  return CORS_PROBLEM_DOMAINS.some(domain => url.includes(domain));
};

/**
 * Создает URL для проксированного изображения
 * @param url Оригинальный URL изображения
 * @param directFetch Флаг для прямой загрузки без кэширования
 * @returns URL к прокси-эндпоинту с оригинальным URL в качестве параметра
 */
export const getProxiedImageUrl = (url: string, directFetch: boolean = false): string => {
  if (!url) return '';
  if (!needsProxying(url)) return url;
  
  try {
    // Кодируем URL для безопасной передачи в качестве параметра
    const encodedUrl = encodeURIComponent(url);
    
    // Конструируем URL к Edge Function с кэшированием изображений
    let proxyUrl = `https://juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy?url=${encodedUrl}${PROXY_SUFFIX}`;
    
    // Добавляем параметр для обхода кэша, если запрошено
    if (directFetch) {
      proxyUrl += '&bypassCache=true';
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
  return url ? url.includes(PROXY_SUFFIX) : false;
};
