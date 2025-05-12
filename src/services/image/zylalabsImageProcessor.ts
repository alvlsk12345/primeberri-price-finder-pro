
/**
 * Специализированные функции для обработки изображений из Zylalabs API
 */
import { getProxiedImageUrl } from './imageProxy';
import { getUniqueImageUrl } from './imageCache';
import { isZylalabsImage } from './imageSourceDetector';

/**
 * Проверяет, является ли URL Zylalabs API эндпоинтом вместо прямой ссылки на изображение
 */
export const isZylalabsApiEndpoint = (url: string): boolean => {
  if (!isZylalabsImage(url)) return false;
  
  // Проверка на типичные признаки API эндпоинтов
  return url.includes('/api/') || 
         url.includes('api.promptapi.com') || 
         url.includes('api.eu-central.promptapi.com') || 
         !url.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i);
};

/**
 * Получает оптимизированный URL для изображений из Zylalabs
 * с принудительным проксированием и прямой загрузкой
 */
export const getOptimizedZylalabsImageUrl = (
  url: string | null, 
  useCache: boolean = false
): string | null => {
  if (!url || !isZylalabsImage(url)) return url;
  
  // Всегда обходим кэш для Zylalabs и используем прямую загрузку
  const uniqueUrl = getUniqueImageUrl(url, undefined, useCache);
  let proxyUrl = getProxiedImageUrl(uniqueUrl, true, true);
  
  // Добавляем параметр forceDirectFetch=true для принудительной прямой загрузки
  if (!proxyUrl.includes('forceDirectFetch=')) {
    proxyUrl += '&forceDirectFetch=true';
  }
  
  // Добавляем уникальный timestamp для избежания проблем с кэшированием
  proxyUrl += `&_ts=${Date.now()}`;
  
  return proxyUrl;
};

/**
 * Создает альтернативные URL для проблемных изображений Zylalabs
 * чтобы попробовать разные стратегии загрузки
 */
export const getZylalabsImageFallbacks = (originalUrl: string | null): string[] => {
  if (!originalUrl || !isZylalabsImage(originalUrl)) return [];
  
  const fallbacks: string[] = [];
  
  // Базовый вариант с принудительным проксированием
  const baseUrl = getOptimizedZylalabsImageUrl(originalUrl, false);
  if (baseUrl) fallbacks.push(baseUrl);
  
  // Вариант с кэшированием
  const cachedUrl = getOptimizedZylalabsImageUrl(originalUrl, true);
  if (cachedUrl && cachedUrl !== baseUrl) fallbacks.push(cachedUrl);
  
  // Вариант с прямой загрузкой и альтернативными заголовками
  const directUrl = getProxiedImageUrl(originalUrl, true, true) + 
    '&forceDirectFetch=true&useAltHeaders=true';
  fallbacks.push(directUrl);
  
  return fallbacks;
};

/**
 * Обрабатывает ошибку загрузки изображения Zylalabs
 * и возвращает следующую альтернативу для попытки
 */
export const handleZylalabsImageError = (
  url: string | null, 
  retryCount: number
): string | null => {
  if (!url || !isZylalabsImage(url)) return null;
  
  const fallbacks = getZylalabsImageFallbacks(url);
  const fallbackIndex = retryCount % fallbacks.length;
  
  // Добавляем уникальный идентификатор попытки
  const fallbackUrl = fallbacks[fallbackIndex];
  if (!fallbackUrl) return null;
  
  return `${fallbackUrl}&retry=${retryCount}`;
};
