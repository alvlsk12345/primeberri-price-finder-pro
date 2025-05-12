
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
  'zylalabs.com'
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
  
  // Проверяем, содержит ли URL один из проблемных доменов
  return CORS_PROBLEM_DOMAINS.some(domain => url.includes(domain));
};

/**
 * Создает URL для проксированного изображения
 * @param url Оригинальный URL изображения
 * @returns URL к прокси-эндпоинту с оригинальным URL в качестве параметра
 */
export const getProxiedImageUrl = (url: string): string => {
  if (!url) return '';
  if (!needsProxying(url)) return url;
  
  try {
    // Кодируем URL для безопасной передачи в качестве параметра
    const encodedUrl = encodeURIComponent(url);
    
    // Конструируем URL к Edge Function с кэшированием изображений
    const proxyUrl = `https://juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy?url=${encodedUrl}${PROXY_SUFFIX}`;
    
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
