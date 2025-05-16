
/**
 * Функции для определения источника изображения
 */
import { isProxiedUrl } from './imageProxy';

/**
 * Проверяет, является ли URL изображением из Google Shopping
 */
export const isGoogleShoppingImage = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('google.com/shopping/product') || 
         url.includes('googleusercontent.com/shopping/');
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
