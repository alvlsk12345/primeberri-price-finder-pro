
import { isValidImageUrl } from '../imageService';
import { 
  isZylalabsImage, 
  isGoogleShoppingImage, 
  isImageRequiringProxy
} from './imageSourceDetector';
import { getUniqueImageUrl } from './imageCache';
import { getProxiedImageUrl } from './imageProxy';
import { formatImageUrl } from './imageUrlFormatter';

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
  if (!imageUrl) {
    return null;
  }

  // Логирование входного URL для диагностики
  console.log(`processProductImage: исходный URL - ${imageUrl?.substring(0, 100)}`);

  // Форматируем URL перед проверкой валидности
  const formattedUrl = formatImageUrl(imageUrl);
  
  // Проверяем валидность форматированного URL
  if (!isValidImageUrl(formattedUrl)) {
    console.log(`processProductImage: невалидный URL после форматирования - ${formattedUrl}`);
    return null;
  }

  // Определяем, является ли второй параметр индексом или флагом кэширования
  const isIndex = typeof indexOrUseCache === 'number';
  const useCache = isIndex ? true : indexOrUseCache;
  const index = isIndex ? indexOrUseCache : undefined;

  // Проверяем тип изображения и нужно ли проксирование
  const isZylalabs = isZylalabsImage(formattedUrl);
  const isGoogleShopping = isGoogleShoppingImage(formattedUrl);
  const isEncryptedTbn = formattedUrl.includes('encrypted-tbn');
  const needsProxy = isImageRequiringProxy(formattedUrl);
  
  console.log(`processProductImage: анализ URL - Zylalabs: ${isZylalabs}, Google Shopping: ${isGoogleShopping}, encrypted-tbn: ${isEncryptedTbn}, требует прокси: ${needsProxy}`);
  
  // Получаем URL с учетом кэширования
  const uniqueUrl = getUniqueImageUrl(formattedUrl, index, useCache);
  
  // Для изображений из Google Shopping, encrypted-tbn и Zylalabs всегда используем directFetch=true при первой загрузке
  const shouldDirectFetch = directFetch || isZylalabs || isGoogleShopping || isEncryptedTbn;
  
  // Применяем прокси при необходимости
  const resultUrl = needsProxy ? getProxiedImageUrl(uniqueUrl, shouldDirectFetch) : uniqueUrl;
  
  console.log(`processProductImage: итоговый URL - ${resultUrl?.substring(0, 100)}`);
  return resultUrl;
};

/**
 * Получает URL изображения базового размера
 * @param url Исходный URL изображения
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns URL изображения базового размера
 */
export const getBaseSizeImageUrl = (url: string | null, useCache: boolean = true): string | null => {
  if (!url) return null;
  
  // Форматируем URL перед обработкой
  const formattedUrl = formatImageUrl(url);
  
  // Для Google изображений заменяем размер на базовый
  if (formattedUrl.includes('googleusercontent.com') && formattedUrl.includes('=w')) {
    return formattedUrl.replace(/=w\d+-h\d+/, '=w300-h300');
  }
  
  // Для Zylalabs изображений применяем оптимизацию размера
  if (isZylalabsImage(formattedUrl)) {
    return getZylalabsSizeImageUrl(formattedUrl, 'medium', useCache);
  }
  
  return processProductImage(formattedUrl, useCache);
};

/**
 * Получает URL изображения большого размера
 * @param url Исходный URL изображения
 * @param useCache Использовать кэширование (по умолчанию true)
 * @returns URL изображения большого размера
 */
export const getLargeSizeImageUrl = (url: string | null, useCache: boolean = true): string | null => {
  if (!url) return null;
  
  // Форматируем URL перед обработкой
  const formattedUrl = formatImageUrl(url);
  
  // Для Google изображений заменяем размер на больший
  if (formattedUrl.includes('googleusercontent.com') && formattedUrl.includes('=w')) {
    return formattedUrl.replace(/=w\d+-h\d+/, '=w800-h800');
  }
  
  // Для Zylalabs изображений применяем оптимизацию размера
  if (isZylalabsImage(formattedUrl)) {
    return getZylalabsSizeImageUrl(formattedUrl, 'large', useCache);
  }
  
  return processProductImage(formattedUrl, useCache);
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
  
  // Добавляем лог для отслеживания обработки Zylalabs изображений
  console.log(`getZylalabsSizeImageUrl: обработка изображения Zylalabs ${size} - ${url.substring(0, 100)}`);
  
  // Для Zylalabs всегда принудительно добавляем параметр directFetch=true для первой загрузки
  return getProxiedImageUrl(getUniqueImageUrl(url, undefined, useCache), true);
};
