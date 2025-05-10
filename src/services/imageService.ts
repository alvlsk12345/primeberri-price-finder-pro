
/**
 * Проверяет, является ли URL изображения из Google Shopping
 * @param imageUrl URL изображения для проверки
 * @returns true, если изображение из Google Shopping
 */
export const isGoogleShoppingImage = (imageUrl: string): boolean => {
  return Boolean(
    imageUrl && (
      imageUrl.includes('googleusercontent.com') || 
      imageUrl.includes('gstatic.com') ||
      imageUrl.includes('google.com') ||
      imageUrl.includes('encrypted-tbn')
    )
  );
};

/**
 * Проверяет, является ли URL изображения пустым или заглушкой
 * @param imageUrl URL изображения для проверки
 * @returns true, если изображение отсутствует или является заглушкой
 */
export const isPlaceholderImage = (imageUrl: string): boolean => {
  return !imageUrl || 
    imageUrl.includes('placeholder') || 
    imageUrl.includes('no-image') || 
    imageUrl.includes('noimage');
};

/**
 * Возвращает URL заглушки для изображения
 * @param title Название товара для альтернативного текста
 * @returns URL заглушки для изображения
 */
export const getPlaceholderImageUrl = (title?: string): string => {
  const text = encodeURIComponent(title || 'Нет изображения');
  return `https://placehold.co/600x400/e2e8f0/cbd5e0?text=${text}`;
};

/**
 * Проверяет, является ли URL изображения валидным
 * @param url URL изображения для проверки
 * @returns true, если изображение валидно
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Проверяем, имеет ли URL правильный формат для изображения
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const hasValidExtension = validExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Проверяем, является ли URL Data URL для изображения
  const isDataUrl = url.startsWith('data:image/');
  
  // Проверяем, является ли URL из доверенного источника
  const isTrustedDomain = (
    url.includes('amazonaws.com') ||
    url.includes('cloudfront.net') ||
    url.includes('googleusercontent.com') ||
    url.includes('ssl-images-amazon') ||
    url.includes('media-amazon') ||
    url.includes('gstatic.com') ||
    url.includes('unsplash.com') ||
    url.includes('placehold.co')
  );
  
  return isDataUrl || isTrustedDomain || hasValidExtension;
};

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
