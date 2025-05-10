
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
