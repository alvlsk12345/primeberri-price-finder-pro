
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
  // Вместо использования внешнего сервиса возвращаем локальный SVG
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#e2e8f0" />
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#94a3b8" text-anchor="middle">
        ${title ? title.substring(0, 30) : 'Нет изображения'}${title && title.length > 30 ? '...' : ''}
      </text>
    </svg>
  `);
};
