
/**
 * Функции для определения источника изображения
 */
import { isProxiedUrl } from './imageProxy';

/**
 * Проверяет, является ли URL изображением из Google Shopping
 */
export const isGoogleShoppingImage = (url: string): boolean => {
  if (!url) return false;
  
  // Расширяем шаблоны для распознавания Google Shopping изображений
  return url.includes('google.com/shopping/product') || 
         url.includes('googleusercontent.com/shopping/') ||
         (url.includes('encrypted-tbn') && url.includes('gstatic.com') && url.includes('shopping'));
};

/**
 * Проверяет, является ли URL изображением из Google CSE (Custom Search Engine)
 */
export const isGoogleCseImage = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('googleapis.com/customsearch');
};

/**
 * Проверяет, является ли URL изображением из Zylalabs API
 */
export const isZylalabsImage = (url: string): boolean => {
  if (!url) return false;
  
  // Расширенный список шаблонов для распознавания изображений Zylalabs
  return url.includes('zylalabs.com') || 
         url.includes('zyla-api') || 
         url.includes('zylahome') ||
         url.includes('zylaproductapi') ||
         url.includes('zylaproduct') ||
         url.includes('images-na.ssl-images-amazon') ||  // Amazon изображения через Zylalabs
         url.includes('m.media-amazon.com');            // Еще один формат Amazon через Zylalabs
};

/**
 * Проверяет, является ли URL с прокси
 */
export const isUrlWithCorsProxy = (url: string): boolean => {
  if (!url) return false;
  
  return isProxiedUrl(url) || url.includes('juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy');
};

/**
 * Проверяет, является ли URL изображением, требующим проксирования
 * Включает все типы изображений, которые обычно вызывают CORS-ошибки
 */
export const isImageRequiringProxy = (url: string): boolean => {
  if (!url) return false;
  
  // Если URL уже проксирован, возвращаем false
  if (isUrlWithCorsProxy(url)) return false;
  
  // Проверяем различные источники изображений, требующие проксирования
  return isGoogleShoppingImage(url) || 
         isGoogleCseImage(url) || 
         isZylalabsImage(url) || 
         url.includes('encrypted-tbn') || 
         url.includes('gstatic.com');
};
