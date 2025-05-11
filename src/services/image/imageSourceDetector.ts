
/**
 * Функции для определения источника изображения
 */

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
  
  return url.includes('zylalabs.com') || 
         url.includes('zyla-api') || 
         url.includes('zylahome');
};

/**
 * Проверяет, является ли URL с прокси (для обеспечения совместимости)
 */
export const isUrlWithCorsProxy = (url: string): boolean => {
  if (!url) return false;
  
  return false;
};
