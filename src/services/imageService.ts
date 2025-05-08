
// Массив реальных изображений для использования в качестве запасных вариантов
export const getUnsplashImages = (): string[] => {
  return [
    `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=${Date.now()}`, // кроссовки
    `https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=${Date.now()}`, // кроссовки 2
    `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=${Date.now()}`, // кроссовки 3
    `https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=${Date.now()}`, // одежда
    `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=${Date.now()}`, // часы
  ];
};

// Функция для получения уникальной ссылки на изображение 
export const getUniqueImageUrl = (baseUrl: string, index: number): string => {
  // Если URL начинается с http и не содержит параметры запроса, добавляем случайный параметр
  if (baseUrl && baseUrl.startsWith('http') && !baseUrl.includes('?')) {
    return `${baseUrl}?t=${Date.now()}-${index}`;
  }
  return baseUrl;
};

// Функция для получения запасного изображения, если основное недоступно
export const getFallbackImage = (index: number): string => {
  const images = getUnsplashImages();
  return images[index % images.length];
};
