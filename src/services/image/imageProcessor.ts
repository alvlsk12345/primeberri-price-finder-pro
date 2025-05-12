
import { isValidImageUrl } from '../imageService';
import { 
  isZylalabsImage, 
  isGoogleShoppingImage,
  isGoogleThumbnail
} from './imageSourceDetector';
import { getUniqueImageUrl } from './imageCache';
import { getProxiedImageUrl } from './imageProxy';

/**
 * Обрабатывает URL изображения продукта для оптимизации отображения
 * @param imageUrl Исходный URL изображения
 * @param indexOrUseCache Индекс изображения или флаг использования кэша
 * @param directFetch Флаг для обхода кэша при первой загрузке
 * @returns Оптимизированный URL изображения
 */
export const processProductImage = (
  imageUrl: string | null, 
  indexOrUseCache: number | boolean = true,
  directFetch: boolean = false
): string | null => {
  if (!imageUrl || !isValidImageUrl(imageUrl)) {
    return null;
  }

  // Определяем, является ли второй параметр индексом или флагом кэширования
  const isIndex = typeof indexOrUseCache === 'number';
  const useCache = isIndex ? true : indexOrUseCache;
  const index = isIndex ? indexOrUseCache : undefined;

  // Проверяем, нужна ли прокси для изображения
  const isZylalabs = isZylalabsImage(imageUrl);
  const isGoogleShopping = isGoogleShoppingImage(imageUrl);
  const isGoogleThumb = isGoogleThumbnail(imageUrl);
  const needsProxy = isZylalabs || isGoogleShopping || isGoogleThumb;
  
  // Получаем URL с учетом кэширования
  const shouldUseCache = useCache && !isGoogleThumb; // Для Google Thumbnails не используем кэш
  const uniqueUrl = getUniqueImageUrl(imageUrl, index, shouldUseCache);
  
  // Для изображений из Zylalabs и Google Thumbnails всегда используем принудительную прямую загрузку
  const shouldDirectFetch = directFetch || isZylalabs || isGoogleThumb;
  
  // Для Zylalabs и Google Thumbnails добавляем принудительную прямую загрузку
  let finalUrl = needsProxy ? getProxiedImageUrl(uniqueUrl, shouldDirectFetch) : uniqueUrl;
  
  // Для Zylalabs и Google Thumbnails всегда добавляем дополнительный параметр forceDirectFetch=true
  if ((isZylalabs || isGoogleThumb) && !finalUrl.includes('forceDirectFetch=true')) {
    finalUrl += '&forceDirectFetch=true';
  }
  
  // Добавляем уникальный timestamp для избежания кэширования браузером
  if (isGoogleThumb && !finalUrl.includes('_t=')) {
    finalUrl += `&_t=${Date.now()}`;
  }
  
  return finalUrl;
};

/**
 * Получает URL изображения базового размера
 * @param url Исходный URL изображения
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns URL изображения базового размера
 */
export const getBaseSizeImageUrl = (url: string | null, useCache: boolean = true): string | null => {
  if (!url) return null;
  
  // Для Google изображений заменяем размер на базовый
  if (url.includes('googleusercontent.com') && url.includes('=w')) {
    return url.replace(/=w\d+-h\d+/, '=w300-h300');
  }
  
  // Для Google Thumbnails всегда применяем прямую загрузку и обход кэша
  if (isGoogleThumbnail(url)) {
    const baseUrl = getProxiedImageUrl(url, true);
    return `${baseUrl}&forceDirectFetch=true&_t=${Date.now()}`;
  }
  
  // Для Zylalabs изображений применяем прямую загрузку с forceDirectFetch=true
  if (isZylalabsImage(url)) {
    return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true) + '&forceDirectFetch=true';
  }
  
  return url;
};

/**
 * Получает URL изображения большого размера
 * @param url Исходный URL изображения
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns URL изображения большого размера
 */
export const getLargeSizeImageUrl = (url: string | null, useCache: boolean = true): string | null => {
  if (!url) return null;
  
  // Проверяем, является ли URL уже проксированным для избежания повторного проксирования
  const isAlreadyProxied = url.includes('juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy');
  
  // Для Google изображений заменяем размер на больший
  if (!isAlreadyProxied && url.includes('googleusercontent.com') && url.includes('=w')) {
    return url.replace(/=w\d+-h\d+/, '=w800-h800');
  }
  
  // Для Google Thumbnails всегда применяем прямую загрузку и обход кэша
  if (isGoogleThumbnail(url)) {
    // Если URL уже проксированный, добавляем только нужные параметры
    if (isAlreadyProxied) {
      // Проверяем, есть ли уже параметр forceDirectFetch
      if (!url.includes('forceDirectFetch=true')) {
        return `${url}&forceDirectFetch=true&_t=${Date.now()}`;
      } else {
        // Если forceDirectFetch уже есть, добавляем только timestamp
        return `${url}&_t=${Date.now()}`;
      }
    }
    // Для нового URL создаем проксированную версию
    const proxyUrl = getProxiedImageUrl(url, true);
    return `${proxyUrl}&forceDirectFetch=true&_t=${Date.now()}`;
  }
  
  // Для Zylalabs изображений всегда принудительно forceDirectFetch=true
  if (isZylalabsImage(url)) {
    // Если URL уже проксированный
    if (isAlreadyProxied) {
      if (!url.includes('forceDirectFetch=true')) {
        return `${url}&forceDirectFetch=true`;
      }
      return url;
    }
    // Добавляем параметр для принудительной прямой загрузки
    return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true) + '&forceDirectFetch=true';
  }
  
  // Проверяем, нужно ли добавить timestamp к существующему проксированному URL
  if (isAlreadyProxied && url.includes('encrypted-tbn')) {
    return `${url}&_t=${Date.now()}`;
  }
  
  return url;
};

/**
 * Получает URL изображения Zylalabs оптимизированного размера
 * @param url Исходный URL изображения
 * @param size Размер изображения (small, medium, large)
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns Оптимизированный URL изображения
 */
export const getZylalabsSizeImageUrl = (url: string | null, size: 'small' | 'medium' | 'large' = 'medium', useCache: boolean = true): string | null => {
  if (!url) return null;
  
  if (!isZylalabsImage(url)) return url;
  
  // Генерируем URL с учетом параметров размера
  const baseUrl = getUniqueImageUrl(url, undefined, useCache);
  
  // Для Zylalabs всегда принудительно добавляем параметр directFetch=true и forceDirectFetch=true для первой загрузки
  let proxyUrl = getProxiedImageUrl(baseUrl, true);
  
  // Добавляем параметр размера
  if (!proxyUrl.includes('size=')) {
    const separator = proxyUrl.includes('?') ? '&' : '?';
    proxyUrl += `${separator}size=${size}`;
  }
  
  // Добавляем параметр forceDirectFetch для принудительной прямой загрузки
  if (!proxyUrl.includes('forceDirectFetch=')) {
    proxyUrl += '&forceDirectFetch=true';
  }
  
  return proxyUrl;
};
