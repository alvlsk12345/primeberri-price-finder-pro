
/**
 * Система кэширования и управления изображениями на клиенте
 * с улучшенным механизмом обработки Zylalabs API
 */

// Ключ для локального хранения информации о загруженных изображениях
const LOADED_IMAGES_KEY = 'loaded_images_cache';

// Время жизни кэша для изображений (24 часа)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Интерфейс для хранения метаданных загруженного изображения
interface ImageCacheEntry {
  url: string;
  loadedAt: number;
}

/**
 * Загружает информацию о ранее загруженных изображениях из localStorage
 */
function getLoadedImagesCache(): Record<string, ImageCacheEntry> {
  try {
    const cacheData = localStorage.getItem(LOADED_IMAGES_KEY);
    const cache = cacheData ? JSON.parse(cacheData) : {};
    
    // Очищаем устаревшие записи
    const now = Date.now();
    const cleanedCache: Record<string, ImageCacheEntry> = {};
    
    for (const [key, entry] of Object.entries(cache)) {
      // Проверяем, что запись является объектом с необходимыми полями
      if (typeof entry === 'object' && entry && 'loadedAt' in entry) {
        const typedEntry = entry as ImageCacheEntry;
        if (now - typedEntry.loadedAt < CACHE_TTL) {
          cleanedCache[key] = typedEntry;
        }
      }
    }
    
    // Сохраняем очищенный кэш
    if (Object.keys(cache).length !== Object.keys(cleanedCache).length) {
      localStorage.setItem(LOADED_IMAGES_KEY, JSON.stringify(cleanedCache));
    }
    
    return cleanedCache;
  } catch (e) {
    console.error('Ошибка при загрузке кэша изображений:', e);
    return {};
  }
}

/**
 * Сохраняет информацию о загруженном изображении в localStorage
 * @param url URL изображения
 */
export function markImageAsLoaded(url: string): void {
  try {
    const cache = getLoadedImagesCache();
    
    // Нормализуем URL для использования в качестве ключа
    const normalizedUrl = getNormalizedUrlForCache(url);
    
    // Сохраняем информацию о загрузке
    cache[normalizedUrl] = {
      url,
      loadedAt: Date.now()
    };
    
    localStorage.setItem(LOADED_IMAGES_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Ошибка при сохранении информации о загруженном изображении:', e);
  }
}

/**
 * Проверяет, было ли изображение успешно загружено ранее
 * @param url URL изображения для проверки
 * @returns true, если изображение было успешно загружено ранее
 */
export function isImageLoaded(url: string): boolean {
  try {
    if (!url) return false;
    
    const cache = getLoadedImagesCache();
    const normalizedUrl = getNormalizedUrlForCache(url);
    
    return normalizedUrl in cache;
  } catch (e) {
    console.error('Ошибка при проверке кэша изображений:', e);
    return false;
  }
}

/**
 * Получает нормализованный URL для использования в кэше
 * @param url Исходный URL
 * @returns Нормализованный URL
 */
function getNormalizedUrlForCache(url: string): string {
  if (!url) return '';
  
  // Убираем параметры запроса для Zylalabs изображений, которые могут меняться
  if (url.includes('zylalabs.com') || 
      url.includes('zyla-api') || 
      url.includes('zylahome') ||
      url.includes('encik.blob.core.windows.net') ||
      url.includes('zdatastore') || 
      url.includes('zyla-pd')) {
    const urlObj = new URL(url);
    // Удаляем параметры времени и повторных попыток
    urlObj.searchParams.delete('t');
    urlObj.searchParams.delete('retry');
    urlObj.searchParams.delete('retryAttempt');
    return urlObj.toString();
  }
  
  // Для других URL - просто удаляем временные метки
  if (url.includes('?')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams(url.split('?')[1]);
    params.delete('t');
    params.delete('retry');
    params.delete('retryAttempt');
    
    const remainingParams = params.toString();
    return remainingParams ? `${baseUrl}?${remainingParams}` : baseUrl;
  }
  
  return url;
}

/**
 * Добавляет уникальность к URL изображения для предотвращения кэширования
 * @param url URL изображения
 * @param index Индекс изображения
 * @param useCache Использовать ли кэш
 * @returns URL с добавленным параметром уникальности
 */
export function getUniqueImageUrl(
  url: string, 
  index?: number, 
  useCache: boolean = true
): string {
  if (!url) return '';
  
  // Если используется кэширование и изображение уже загружено - не модифицируем URL
  if (useCache && isImageLoaded(url)) {
    return url;
  }
  
  // Определяем, является ли URL из Zylalabs API
  const isZylalabs = url.includes('zylalabs.com') || 
                    url.includes('zyla-api') || 
                    url.includes('zylahome') ||
                    url.includes('encik.blob.core.windows.net') ||
                    url.includes('zdatastore') || 
                    url.includes('zyla-pd');
  
  // Добавляем параметр уникальности
  const separator = url.includes('?') ? '&' : '?';
  const uniqueSuffix = index !== undefined ? `index=${index}` : `t=${Date.now()}`;
  
  // Для Zylalabs всегда добавляем временную метку
  if (isZylalabs) {
    return `${url}${separator}t=${Date.now()}`;
  }
  
  return `${url}${separator}${uniqueSuffix}`;
}
