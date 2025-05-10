
/**
 * Добавляет уникальный параметр к URL изображения для предотвращения кэширования
 * @param url URL изображения
 * @param index Индекс изображения (для дополнительной уникальности)
 * @returns URL с добавленным параметром предотвращения кэширования
 */
export const getUniqueImageUrl = (url: string, index?: number): string => {
  if (!url) return '';
  
  // Не добавляем параметры к data URL
  if (url.startsWith('data:')) return url;
  
  // Добавляем параметр для предотвращения кэширования
  const separator = url.includes('?') ? '&' : '?';
  const cacheParam = `nocache=${Date.now()}${index !== undefined ? `-${index}` : ''}`;
  
  return `${url}${separator}${cacheParam}`;
};
