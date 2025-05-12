
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
 * @param title Название бренда или товара для отображения в заглушке
 * @returns URL заглушки для изображения в формате data:image/svg+xml
 */
export const getPlaceholderImageUrl = (title?: string): string => {
  // Вместо внешнего сервиса используем локальный data URL с SVG
  // Это решит проблему недоступности внешних сервисов и возможные проблемы с CORS
  const text = title ? (title.length > 20 ? title.substring(0, 20) + '...' : title) : 'Нет изображения';
  
  // Создаем более визуально привлекательный SVG с текстом и логотипом бренда
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#f1f5f9"/>
      <rect x="150" y="100" width="300" height="200" stroke="#94a3b8" stroke-width="2" fill="#e2e8f0" rx="8" ry="8"/>
      <text x="300" y="180" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#64748b">${text}</text>
      <rect x="250" y="200" width="100" height="60" rx="5" ry="5" fill="#64748b"/>
      <path d="M275 215 L325 215 L325 245 L275 245 Z" stroke="#e2e8f0" stroke-width="2" fill="none"/>
      <line x1="275" y1="215" x2="325" y2="245" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="325" y1="215" x2="275" y2="245" stroke="#e2e8f0" stroke-width="2"/>
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

/**
 * Возвращает URL заглушки для изображения с лого бренда
 * @param brand Название бренда
 * @param size Размер изображения
 * @returns URL заглушки для изображения
 */
export const getBrandPlaceholderImageUrl = (brand: string, size: 'sm' | 'md' | 'lg' = 'md'): string => {
  // Размеры SVG в зависимости от запрошенного размера
  const dimensions = {
    sm: { width: 300, height: 200 },
    md: { width: 600, height: 400 },
    lg: { width: 900, height: 600 }
  };
  
  const { width, height } = dimensions[size];
  
  // Подготовка текста бренда
  const brandText = brand ? (brand.length > 25 ? brand.substring(0, 25) + '...' : brand) : 'Brand';
  const fontSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;

  // Создаем более визуально привлекательный SVG с логотипом бренда
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f8fafc"/>
      <rect x="${width*0.1}" y="${height*0.2}" width="${width*0.8}" height="${height*0.6}" stroke="#cbd5e1" stroke-width="2" fill="#f1f5f9" rx="8" ry="8"/>
      <circle cx="${width/2}" cy="${height*0.35}" r="${width*0.08}" fill="#94a3b8"/>
      <text x="${width/2}" y="${height*0.35}" font-family="Arial, sans-serif" font-size="${fontSize*1.2}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#f1f5f9">${brandText.substring(0, 1).toUpperCase()}</text>
      <text x="${width/2}" y="${height*0.6}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#334155">${brandText}</text>
      <text x="${width/2}" y="${height*0.7}" font-family="Arial, sans-serif" font-size="${fontSize*0.6}" text-anchor="middle" fill="#64748b">Изображение недоступно</text>
    </svg>
  `;
  
  // Кодируем SVG в URI-компонент для использования в data URL
  const encodedSvg = encodeURIComponent(svgContent.trim())
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
    .replace(/%22/g, "'");
    
  return `data:image/svg+xml,${encodedSvg}`;
};
