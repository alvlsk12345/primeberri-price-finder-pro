
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
      imageUrl.includes('google.com')
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
