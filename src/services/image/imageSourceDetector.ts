
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
  
  // Список доменов и идентификаторов Google Shopping
  const googleShoppingIndicators = [
    'googleusercontent.com',
    'gstatic.com',
    'google.com',
    'encrypted-tbn', 
    'googleusercontent', 
    'gstatic.com/shopping',
    'shopping/product'
  ];
  
  // Проверяем, содержит ли URL какой-либо из индикаторов Google Shopping
  return googleShoppingIndicators.some(indicator => url.includes(indicator));
};

/**
 * Проверяет, является ли URL результатом Google CSE API
 */
export const isGoogleCseImage = (url: string): boolean => {
  if (!url) return false;
  
  // Список доменов и идентификаторов Google CSE API
  const googleCseIndicators = [
    'googleusercontent.com',
    'gstatic.com',
    'ggpht.com',
    'cse.google.com'
  ];
  
  // Проверяем, содержит ли URL какой-либо из индикаторов Google CSE API
  return googleCseIndicators.some(indicator => url.includes(indicator));
};

/**
 * Проверяет, относится ли URL к изображению Google (любому)
 */
export const isGoogleImage = (url: string): boolean => {
  return isGoogleShoppingImage(url) || isGoogleCseImage(url);
};

/**
 * Проверяет, является ли URL проксированным
 */
export const isProxiedUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Список известных прокси-сервисов
  const proxyIndicators = [
    'corsproxy.io',
    'allorigins.win', 
    'cors-anywhere',
    'thingproxy',
    'api.codetabs.com',
    'proxy.cors.sh',
    'cors.bridged.cc'
  ];
  
  // Проверяем, содержит ли URL какой-либо из индикаторов прокси
  return proxyIndicators.some(proxy => url.includes(proxy));
};
