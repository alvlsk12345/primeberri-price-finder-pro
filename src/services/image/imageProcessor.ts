
import { isValidImageUrl } from '../imageService';
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

  // Проверяем, нужна ли прокси для изображения
  const needsProxy = isZylalabsImage(imageUrl) || isGoogleShoppingImage(imageUrl);
  
  // Получаем URL с учетом кэширования
  // Важно: всегда используем кэширование для Zylalabs изображений
  const shouldUseCache = isZylalabsImage(imageUrl) ? true : useCache;
  const uniqueUrl = getUniqueImageUrl(imageUrl, index, shouldUseCache);
  
  // Для изображений из Zylalabs всегда используем directFetch=true при первой загрузке
  const shouldDirectFetch = directFetch || isZylalabsImage(imageUrl);
  
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
  
  // Для Zylalabs изображений применяем оптимизацию размера
  return getZylalabsSizeImageUrl(url, 'medium', useCache);
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
  
  // Для Zylalabs изображений применяем оптимизацию размера
  return getZylalabsSizeImageUrl(url, 'large', useCache);
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
  
  // Для Zylalabs всегда применяем кэширование для повышения производительности
  return getUniqueImageUrl(url, undefined, true);
};
