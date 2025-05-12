
/**
 * Добавляет уникальный параметр к URL изображения для предотвращения кэширования
 * @param url URL изображения
 * @param index Индекс изображения (для дополнительной уникальности)
 * @param useCache Если true, не добавляет параметр для управления кэшированием
 * @returns URL с добавленным параметром предотвращения кэширования
 */
export const getUniqueImageUrl = (url: string, index?: number, useCache: boolean = true): string => {
  if (!url) return '';
  
  // Не добавляем параметры к data URL
  if (url.startsWith('data:')) return url;
  
  // Если указано использовать кэширование, возвращаем URL как есть
  if (useCache) return url;
  
  // Добавляем параметр для предотвращения кэширования только если не используем кэш
  const separator = url.includes('?') ? '&' : '?';
  const cacheParam = `nocache=${Date.now()}${index !== undefined ? `-${index}` : ''}`;
  
  return `${url}${separator}${cacheParam}`;
};

// Кэш загруженных изображений на стороне клиента
const imageLoadCache = new Map<string, boolean>();

/**
 * Проверяет, было ли изображение уже успешно загружено
 * @param url URL изображения
 * @returns true, если изображение было успешно загружено ранее
 */
export const isImageLoaded = (url: string): boolean => {
  return imageLoadCache.has(url);
};

/**
 * Отмечает изображение как успешно загруженное
 * @param url URL изображения
 */
export const markImageAsLoaded = (url: string): void => {
  imageLoadCache.set(url, true);
};

/**
 * Очищает кэш загруженных изображений
 */
export const clearImageLoadCache = (): void => {
  imageLoadCache.clear();
};
