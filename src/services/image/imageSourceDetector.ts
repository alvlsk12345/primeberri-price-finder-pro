
/**
 * Проверяет, является ли URL изображения от Zylalabs API
 */
export const isZylalabsImage = (url: string): boolean => {
  if (!url) return false;
  
  // Проверяем URL на принадлежность к Zylalabs API
  return url.includes('zylalabs.com') || 
         url.includes('rapidapi.com') || 
         url.includes('rapidapi-prod-') ||
         url.includes('zyla-api') ||
         url.includes('api.zyla') || 
         url.includes('zylaapi') ||
         // Добавляем дополнительные домены, связанные с Zylalabs
         url.includes('zylasearch') ||
         url.includes('zylaimg') ||
         url.includes('zyla-img');
};

/**
 * Проверяет, является ли URL изображения от Google Shopping
 */
export const isGoogleShoppingImage = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('googleusercontent.com') || 
         url.includes('gstatic.com') ||
         url.includes('google.com') ||
         url.includes('encrypted-tbn') || 
         url.includes('googleusercontent') || 
         url.includes('gstatic.com/shopping');
};

/**
 * Проверяет, является ли URL результатом Google CSE API
 */
export const isGoogleCseImage = (url: string): boolean => {
  return Boolean(url && (
    url.includes('googleusercontent.com') || 
    url.includes('gstatic.com') || 
    url.includes('ggpht.com')
  ));
};

