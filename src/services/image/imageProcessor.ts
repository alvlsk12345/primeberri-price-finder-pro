
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
  const needsProxy = isZylalabsImage(imageUrl) || 
                    isGoogleShoppingImage(imageUrl) || 
                    isGoogleThumbnail(imageUrl);
  
  // Получаем URL с учетом кэширования
  const shouldUseCache = useCache;
  const uniqueUrl = getUniqueImageUrl(imageUrl, index, shouldUseCache);
  
  // Для изображений из Zylalabs и Google Thumbnails всегда используем directFetch=true при первой загрузке
  const shouldDirectFetch = directFetch || isZylalabsImage(imageUrl) || isGoogleThumbnail(imageUrl);
  
  // Применяем прокси только если нужно
  return needsProxy ? getProxiedImageUrl(uniqueUrl, shouldDirectFetch) : uniqueUrl;
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
  
  // Для Zylalabs изображений применяем оптимизацию размера и всегда directFetch=true
  if (isZylalabsImage(url)) {
    return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true);
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
  
  // Для Zylalabs изображений применяем оптимизацию размера
  if (isZylalabsImage(url)) {
    return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true);
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
  
  // Для Zylalabs всегда принудительно добавляем параметр directFetch=true для первой загрузки
  return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true);
};
