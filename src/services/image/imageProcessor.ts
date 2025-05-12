
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
  const shouldUseCache = useCache;
  const uniqueUrl = getUniqueImageUrl(imageUrl, index, shouldUseCache);
  
  // Для изображений из Zylalabs всегда используем принудительную прямую загрузку
  const shouldDirectFetch = directFetch || isZylalabs || isGoogleThumb;
  
  // Для Zylalabs добавляем принудительную прямую загрузку
  let finalUrl = needsProxy ? getProxiedImageUrl(uniqueUrl, shouldDirectFetch) : uniqueUrl;
  
  // Для Zylalabs добавляем дополнительный параметр forceDirectFetch=true
  if (isZylalabs && !finalUrl.includes('forceDirectFetch=true')) {
    finalUrl += '&forceDirectFetch=true';
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
  
  // Для Google Thumbnails применяем прямую загрузку
  if (isGoogleThumbnail(url)) {
    return getProxiedImageUrl(url, true);
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
  
  // Для Google изображений заменяем размер на больший
  if (url.includes('googleusercontent.com') && url.includes('=w')) {
    return url.replace(/=w\d+-h\d+/, '=w800-h800');
  }
  
  // Для Google Thumbnails применяем прямую загрузку с большим размером
  if (isGoogleThumbnail(url)) {
    return getProxiedImageUrl(url, true);
  }
  
  // Для Zylalabs изображений всегда принудительно forceDirectFetch=true
  if (isZylalabsImage(url)) {
    // Добавляем параметр для принудительной прямой загрузки
    return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true) + '&forceDirectFetch=true';
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
