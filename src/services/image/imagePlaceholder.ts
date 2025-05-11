
// Функция для генерации URL заполнителя изображения
export const getPlaceholderImageUrl = (text: string): string => {
  // Нормализуем текст
  const normalizedText = text
    .trim()
    .replace(/\s+/g, '+')
    .replace(/[^\w\s+]/g, '')
    .substring(0, 30);
  
  // Получаем случайный цвет на основе входного текста
  const getColorFromText = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
    return color;
  };
  
  const color = getColorFromText(text);
  const textColor = '000000';
  
  // Формируем URL для службы создания заполнителя изображения
  return `https://placehold.co/600x400/${color}/${textColor}?text=${normalizedText}`;
};

// Проверка является ли URL заполнителем изображения
export const isPlaceholderImage = (url: string): boolean => {
  return url?.includes('placehold.co');
};
