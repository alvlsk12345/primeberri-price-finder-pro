
import { isValidImageUrl, getUniqueImageUrl } from './imageService';

// Функция для обработки изображения товара
export const processProductImage = (imageUrl: string | undefined, index: number): string => {
  // Убедимся, что imageUrl - строка
  let processedUrl = typeof imageUrl === 'string' ? imageUrl : '';
  
  // Форматируем URL изображения
  processedUrl = processedUrl.trim();
  
  // Добавляем протокол, если его нет
  if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
    processedUrl = `https://${processedUrl}`;
  }
  
  // Преобразуем относительные URL в абсолютные
  if (processedUrl && processedUrl.startsWith('//')) {
    processedUrl = `https:${processedUrl}`;
  }
  
  // Проверяем, валидный ли URL изображения
  if (!isValidImageUrl(processedUrl)) {
    console.log(`Невалидный URL изображения: ${processedUrl}`);
    return '';
  }
  
  // Добавляем уникальный параметр к URL
  return getUniqueImageUrl(processedUrl, index);
};

