
// Улучшенная проверка валидности URL изображения
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    
    // Проверяем протокол
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    
    // Проверяем расширение файла или параметры, указывающие на изображение
    const isImageExtension = url.match(/\.(jpeg|jpg|gif|png|webp|avif|tiff|svg)($|\?)/i) !== null;
    
    // Проверяем, не содержит ли URL подозрительных паттернов
    const hasSuspiciousDomain = url.includes('placeholder') || 
                               url.includes('dummy') || 
                               url.includes('sample');
    
    return isImageExtension && !hasSuspiciousDomain;
  } catch (e) {
    return false;
  }
};

// Удаляем параметры размера изображения для улучшения совместимости
export const cleanImageUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Удаляем специфичные для CDN параметры размера
    ['width', 'height', 'w', 'h', 'size', 'sz', 'resize', 'fit'].forEach(param => {
      parsedUrl.searchParams.delete(param);
    });
    
    return parsedUrl.toString();
  } catch (e) {
    return url;
  }
};

// Функция для получения уникальной ссылки на изображение 
export const getUniqueImageUrl = (baseUrl: string, index: number): string => {
  // Проверяем валидность URL и очищаем его
  if (!baseUrl) return '';
  
  try {
    // Если URL не начинается с http/https, возвращаем пустую строку
    if (!baseUrl.startsWith('http')) return '';
    
    const cleanedUrl = cleanImageUrl(baseUrl);
    
    // Добавляем параметр времени для предотвращения кеширования
    const separator = cleanedUrl.includes('?') ? '&' : '?';
    return `${cleanedUrl}${separator}t=${Date.now()}-${index}`;
    
  } catch (e) {
    console.error('Ошибка при обработке URL изображения:', e);
    return '';
  }
};

// Заглушка для совместимости (пустая ссылка вместо fallback)
export const getFallbackImage = (): string => {
  return '';
};

// Функция проверки соответствия изображения названию товара
export const validateImageTitleMatch = (imageUrl: string, title: string): boolean => {
  // Это простая эвристика, которая может быть улучшена в будущем
  if (!imageUrl || !title) return false;
  
  // Извлекаем ключевые слова из названия товара (бренды, типы товаров)
  const titleLower = title.toLowerCase();
  const keyBrands = ['nike', 'adidas', 'tommy hilfiger', 'puma', 'reebok', 'lacoste', 'gucci', 'zara'];
  const keyProductTypes = ['куртка', 'кроссовки', 'футболка', 'джинсы', 'часы', 'сумка', 'рубашка', 'шапка'];
  
  // Ищем совпадения брендов в URL
  const brandInUrl = keyBrands.some(brand => 
    imageUrl.toLowerCase().includes(brand.replace(' ', '')) || 
    imageUrl.toLowerCase().includes(brand.replace(' ', '-'))
  );
  
  // Ищем совпадения типов товаров в URL
  const productTypeInUrl = keyProductTypes.some(type => 
    imageUrl.toLowerCase().includes(type) || 
    imageUrl.toLowerCase().includes(type.slice(0, -1)) // Для обработки единственного числа
  );
  
  // URL должен содержать хотя бы часть названия товара
  const nameInUrl = titleLower.split(' ').some(word => {
    // Игнорируем короткие слова (предлоги, союзы и т.д.)
    if (word.length <= 2) return false;
    return imageUrl.toLowerCase().includes(word);
  });
  
  // URL содержит либо бренд, либо тип товара, либо часть названия
  return brandInUrl || productTypeInUrl || nameInUrl;
};
