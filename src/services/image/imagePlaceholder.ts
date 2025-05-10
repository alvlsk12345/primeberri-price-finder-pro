
/**
 * Проверяет, является ли URL изображения пустым или заглушкой
 * @param imageUrl URL изображения для проверки
 * @returns true, если изображение отсутствует или является заглушкой
 */
export const isPlaceholderImage = (imageUrl: string): boolean => {
  return !imageUrl || 
    imageUrl.includes('placeholder') || 
    imageUrl.includes('no-image') || 
    imageUrl.includes('noimage') ||
    imageUrl.includes('placehold.co');
};

/**
 * Возвращает URL заглушки для изображения
 * @param title Название товара для альтернативного текста
 * @returns URL заглушки для изображения
 */
export const getPlaceholderImageUrl = (title?: string): string => {
  // Вместо использования внешнего сервиса placehold.co
  // генерируем data:image/svg+xml для локальной заглушки
  const text = title ? title.slice(0, 20) : 'Нет изображения';
  const encodedText = encodeURIComponent(text);
  
  // Создаем SVG изображение с текстом
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#e2e8f0" />
      <text x="300" y="200" font-family="Arial, sans-serif" font-size="24" fill="#718096" text-anchor="middle">${encodedText}</text>
      <rect x="240" y="220" width="120" height="5" fill="#cbd5e0" />
    </svg>
  `;
  
  // Возвращаем data URL с SVG
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
