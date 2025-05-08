
import { isValidImageUrl, getUniqueImageUrl } from './imageService';

// Функция для проверки, является ли URL от Google Shopping
export const isGoogleShoppingImage = (url: string): boolean => {
  return url.includes('encrypted-tbn') || 
         url.includes('googleusercontent') || 
         url.includes('gstatic.com/shopping');
};

// Функция для обработки изображения товара
export const processProductImage = (imageUrl: string | undefined, index: number): string => {
  // Убедимся, что imageUrl - строка
  let processedUrl = typeof imageUrl === 'string' ? imageUrl : '';
  
  // Если это пустая строка, ничего не делаем
  if (!processedUrl) {
    console.log(`Пустой URL изображения для индекса ${index}`);
    return '';
  }
  
  console.log(`Обрабатываем изображение: ${processedUrl}`);
  
  // Форматируем URL изображения
  processedUrl = processedUrl.trim();
  
  // Удаляем экранирование слешей, если они есть
  if (processedUrl.includes('\\/')) {
    processedUrl = processedUrl.replace(/\\\//g, '/');
    console.log(`Удалены экранированные слеши: ${processedUrl}`);
  }
  
  // Удаляем кавычки из URL, если они есть
  if (processedUrl.startsWith('"') && processedUrl.endsWith('"')) {
    processedUrl = processedUrl.substring(1, processedUrl.length - 1);
    console.log(`Удалены кавычки: ${processedUrl}`);
  }
  
  // Для URL от Google Shopping (encrypted-tbn) используем особую обработку
  if (isGoogleShoppingImage(processedUrl)) {
    console.log(`Обнаружен URL Google Shopping: ${processedUrl}`);
    
    // Проверяем, начинается ли URL с http или https
    if (!processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
      processedUrl = `https://${processedUrl}`;
    } else if (processedUrl.startsWith('//')) {
      processedUrl = `https:${processedUrl}`;
    }
    
    return processedUrl; // Возвращаем URL как есть без дополнительной обработки
  }
  
  // Добавляем протокол, если его нет
  if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
    processedUrl = `https://${processedUrl}`;
    console.log(`Добавлен протокол https: ${processedUrl}`);
  }
  
  // Преобразуем относительные URL в абсолютные
  if (processedUrl && processedUrl.startsWith('//')) {
    processedUrl = `https:${processedUrl}`;
    console.log(`Преобразован относительный URL: ${processedUrl}`);
  }
  
  // Обрабатываем особые случаи URL
  if (processedUrl && processedUrl.includes('data:image')) {
    console.log('Обнаружен Data URL изображения, использование без изменений');
    return processedUrl;
  }
  
  // Проверяем, валидный ли URL изображения
  if (!isValidImageUrl(processedUrl)) {
    console.log(`Невалидный URL изображения: ${processedUrl}`);
    return '';
  }
  
  // Добавляем уникальный параметр к URL для избежания кэширования
  const finalUrl = getUniqueImageUrl(processedUrl, index);
  console.log(`Финальный URL изображения: ${finalUrl}`);
  
  return finalUrl;
};
