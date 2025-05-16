
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
  'images-na.ssl-images-amazon',
  'm.media-amazon.com'
];

/**
 * Проверяет, нуждается ли URL в проксировании для обхода CORS-ограничений
 */
export const needsProxying = (url: string): boolean => {
  if (!url) return false;
  
  // Если URL уже проксирован, не проксируем повторно
  if (url.includes(PROXY_SUFFIX)) {
    console.log(`URL уже проксирован: ${url.substring(0, 100)}`);
    return false;
  }
  
  // Не проксируем data URLs
  if (url.startsWith('data:')) {
    console.log(`Не проксируем data URL: ${url.substring(0, 50)}...`);
    return false;
  }
  
  // Не проксируем изображения из Supabase Storage, которые уже кэшированы
  if (url.includes('juacmpkewomkducoanle.supabase.co/storage/v1/object/public/product-images')) {
    console.log(`Не проксируем кэшированное изображение из Supabase: ${url.substring(0, 100)}`);
    return false;
  }
  
  // Всегда проксируем encrypted-tbn изображения (Google Shopping миниатюры)
  if (url.includes('encrypted-tbn')) {
    console.log(`URL содержит encrypted-tbn, требуется проксирование: ${url.substring(0, 100)}`);
    return true;
  }
  
  // Проверяем, содержит ли URL один из проблемных доменов
  const needsProxy = CORS_PROBLEM_DOMAINS.some(domain => url.includes(domain));
  
  // Логирование для отладки
  if (needsProxy) {
    console.log(`URL нуждается в проксировании: ${url.substring(0, 100)}`);
  } else {
    console.log(`URL не требует проксирования: ${url.substring(0, 100)}`);
  }
  
  return needsProxy;
};

/**
 * Создает URL для проксированного изображения
 * @param url Оригинальный URL изображения
 * @param directFetch Флаг для прямой загрузки без кэширования
 * @returns URL к прокси-эндпоинту с оригинальным URL в качестве параметра
 */
export const getProxiedImageUrl = (url: string, directFetch: boolean = false): string => {
  if (!url) return '';
  
  // Проверяем на необходимость проксирования
  if (!needsProxying(url)) {
    return url;
  }
  
  try {
    // Логирование для отладки
    console.log(`Проксирование URL: ${url.substring(0, 100)}, directFetch=${directFetch}`);
    
    // Кодируем URL для безопасной передачи в качестве параметра
    const encodedUrl = encodeURIComponent(url);
    
    // Для Google Shopping и Zylalabs изображений всегда используем directFetch при первой загрузке
    const shouldBypassCache = directFetch || 
                              url.includes('encrypted-tbn') || 
                              url.includes('zylalabs.com') || 
                              url.includes('images-na.ssl-images-amazon') || 
                              url.includes('m.media-amazon.com');
    
    // Конструируем URL к Edge Function с кэшированием изображений
    let proxyUrl = `https://juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy?url=${encodedUrl}${PROXY_SUFFIX}`;
    
    // Добавляем параметр для обхода кэша, если запрошено
    if (shouldBypassCache) {
      proxyUrl += '&bypassCache=true';
    }
    
    // Добавляем уникальный timestamp для предотвращения кэширования браузером
    proxyUrl += `&t=${Date.now()}`;
    
    // Логирование итогового URL
    console.log(`Итоговый проксированный URL: ${proxyUrl.substring(0, 100)}`);
    
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
