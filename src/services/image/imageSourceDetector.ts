
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
 * Проверяет, является ли URL изображением миниатюры Google (encrypted-tbn)
 */
export const isGoogleThumbnail = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('encrypted-tbn');
};

/**
 * Проверяет, является ли URL изображением из любого Google источника
 */
export const isGoogleImage = (url: string): boolean => {
  if (!url) return false;
  
  return isGoogleShoppingImage(url) || isGoogleCseImage(url) || 
         url.includes('googleusercontent.com') || url.includes('gstatic.com') ||
         url.includes('ggpht.com') || isGoogleThumbnail(url);
};

/**
 * Проверяет, является ли URL изображением из Zylalabs API
 */
export const isZylalabsImage = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('zylalabs.com') || 
         url.includes('api.promptapi.com') ||
         url.includes('api.eu-central.promptapi.com') ||
         url.includes('zyla-api') || 
         url.includes('zylahome');
};

/**
 * Проверяет, является ли URL с прокси
 */
export const isUrlWithCorsProxy = (url: string): boolean => {
  if (!url) return false;
  
  return isProxiedUrl(url) || url.includes('juacmpkewomkducoanle.supabase.co/functions/v1/image-proxy');
};

/**
 * Определяет тип источника изображения для выбора стратегии загрузки
 */
export const getImageSourceType = (url: string): 'google' | 'zylalabs' | 'proxied' | 'standard' => {
  if (!url) return 'standard';
  
  if (isProxiedUrl(url)) return 'proxied';
  if (isZylalabsImage(url)) return 'zylalabs';
  if (isGoogleImage(url)) return 'google';
  
  return 'standard';
};
