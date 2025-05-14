
import { isValidImageUrl } from './imageValidator';
import { 
  isZylalabsImage, 
  isGoogleShoppingImage
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

  // Проверяем источник изображения
  const isZylalabs = isZylalabsImage(imageUrl);
  const isGoogleShopping = isGoogleShoppingImage(imageUrl);
  
  // Проверяем, нужна ли прокси для изображения
  // Для Zylalabs используем всегда только прямую загрузку без прокси 
  const needsProxy = !isZylalabs && isGoogleShopping;
  
  // Получаем URL с учетом кэширования
  const uniqueUrl = getUniqueImageUrl(imageUrl, index, useCache);
  
  // Для изображений из Zylalabs добавляем временную метку для обхода кэша
  const processedUrl = isZylalabs 
    ? `${uniqueUrl}${uniqueUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
    : uniqueUrl;
    
  // Применяем прокси только если нужно (не для Zylalabs)
  return needsProxy ? getProxiedImageUrl(processedUrl, directFetch) : processedUrl;
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
  
  // Для Zylalabs изображений не применяем прокси, а используем прямой URL
  if (isZylalabsImage(url)) {
    return url;
  }
  
  return processProductImage(url, useCache);
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
  
  // Для Zylalabs изображений не применяем прокси
  if (isZylalabsImage(url)) {
    return url;
  }
  
  return processProductImage(url, useCache);
};

/**
 * Получает URL изображения Zylalabs оптимизированного размера
 * @param url Исходный URL изображения
 * @param size Размер изображения (small, medium, large)
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns Оптимизированный URL изображения
 */
export const getZylalabsSizeImageUrl = (url: string, size: 'small' | 'medium' | 'large' = 'medium', useCache: boolean = true): string => {
  if (!url) return '';
  
  if (!isZylalabsImage(url)) return url;
  
  // Для Zylalabs больше не применяем прокси, используем прямой URL с добавлением временной метки
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
};
