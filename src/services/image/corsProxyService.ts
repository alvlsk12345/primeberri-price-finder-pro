
import { isZylalabsImage } from './imageSourceDetector';

/**
 * Проверка необходимости использования CORS-прокси на основе URL
 */
export const shouldUseCorsProxy = (url: string): boolean => {
  // Расширенная проверка для определения доменов с проблемами CORS
  return (
    isZylalabsImage(url) || 
    // Проверяем Google Shopping URL на необходимость использования прокси
    url.includes('encrypted-tbn') ||
    url.includes('zylaapi.') || 
    url.includes('api-zyla.') ||
    url.includes('zylasearch.') ||
    url.includes('.zylaimg.') ||
    url.includes('zyla-img.')
  );
};

/**
 * Проверяет, является ли URL уже проксированным через CORS-прокси
 */
export const isProxiedUrl = (url: string): boolean => {
  return url.includes('corsproxy.io') || 
         url.includes('cors-anywhere') || 
         url.includes('proxy.cors');
};

/**
 * Применяет CORS-прокси к URL
 */
export const applyCorsProxy = (url: string): string => {
  // Используем публичный CORS-прокси
  const corsProxyUrl = 'https://corsproxy.io/?';
  
  // Не применяем прокси к URL, которые уже его используют
  if (isProxiedUrl(url)) {
    return url;
  }
  
  console.log(`Применяем CORS-прокси для URL: ${url}`);
  return `${corsProxyUrl}${encodeURIComponent(url)}`;
};
