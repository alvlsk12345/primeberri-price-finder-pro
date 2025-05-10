
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
  // Вместо внешнего сервиса используем локальный data URL с SVG
  // Это решит проблему недоступности внешних сервисов и возможные проблемы с CORS
  const text = title ? (title.length > 20 ? title.substring(0, 20) + '...' : title) : 'Нет изображения';
  
  // Создаем SVG с текстом в виде Data URL
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#e2e8f0"/>
      <text x="300" y="200" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#64748b">${text}</text>
      <path d="M250 150 L350 150 L350 250 L250 250 Z" stroke="#94a3b8" stroke-width="8" fill="none"/>
      <line x1="250" y1="150" x2="350" y2="250" stroke="#94a3b8" stroke-width="8"/>
      <line x1="350" y1="150" x2="250" y2="250" stroke="#94a3b8" stroke-width="8"/>
    </svg>
  `;
  
  // Кодируем SVG в base64 для использования в data URL
  const encodedSvg = encodeURIComponent(svgContent.trim())
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
    .replace(/%22/g, "'");
    
  return `data:image/svg+xml,${encodedSvg}`;
};
