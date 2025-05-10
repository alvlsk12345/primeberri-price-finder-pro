
import { isValidImageUrl, getUniqueImageUrl } from '../imageService';
import { 
  isZylalabsImage, 
  isGoogleShoppingImage, 
  isGoogleCseImage 
} from './imageSourceDetector';
import { 
  cleanMarkdownUrl, 
  formatImageUrl 
} from './imageUrlFormatter';
import { 
  shouldUseCorsProxy, 
  applyCorsProxy 
} from './corsProxyService';

/**
 * Улучшенная функция для обработки изображения товара
 */
export const processProductImage = (imageUrl: string | undefined, index: number): string => {
  // Убедимся, что imageUrl - строка
  let processedUrl = typeof imageUrl === 'string' ? imageUrl : '';
  
  // Если это пустая строка, ничего не делаем
  if (!processedUrl) {
    console.log(`Пустой URL изображения для индекса ${index}`);
    return '';
  }
  
  console.log(`Обрабатываем изображение: ${processedUrl}`);
  
  // Очищаем URL от Markdown-разметки, если она есть
  processedUrl = cleanMarkdownUrl(processedUrl);
  
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

  // Особая обработка для URL от Google (в том числе из Zylalabs API) 
  if (isGoogleShoppingImage(processedUrl)) {
    console.log(`Обнаружен URL Google Shopping: ${processedUrl}`);
    processedUrl = formatImageUrl(processedUrl);
    
    // К "encrypted-tbn" URL почти всегда нужен прокси
    if (processedUrl.includes('encrypted-tbn')) {
      console.log(`Применяем прокси к Google Shopping URL: ${processedUrl}`);
      return applyCorsProxy(processedUrl);
    }
    
    return processedUrl;
  }

  // Особая обработка для изображений Zylalabs
  if (isZylalabsImage(processedUrl)) {
    console.log(`Обнаружен URL Zylalabs: ${processedUrl}`);
    processedUrl = formatImageUrl(processedUrl);
    
    // Применяем CORS-прокси для Zylalabs изображений
    return applyCorsProxy(processedUrl);
  }
  
  // Для URL от Google CSE используем особую обработку
  if (isGoogleCseImage(processedUrl)) {
    console.log(`Обнаружен URL Google CSE: ${processedUrl}`);
    processedUrl = formatImageUrl(processedUrl);
    return processedUrl;
  }
  
  // Проверяем необходимость использования CORS-прокси для других доменов
  if (processedUrl && shouldUseCorsProxy(processedUrl)) {
    processedUrl = applyCorsProxy(processedUrl);
  }
  
  // Форматируем URL (добавляем протокол, обрабатываем относительные URL)
  processedUrl = formatImageUrl(processedUrl);
  
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
