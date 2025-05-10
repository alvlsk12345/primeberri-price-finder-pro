
import { isValidImageUrl, getUniqueImageUrl, isGoogleShoppingImage as isGoogleImageFromService } from './imageService';

// Улучшенная функция для проверки, является ли URL от Zylalabs API
export const isZylalabsImage = (url: string): boolean => {
  if (!url) return false;
  
  // Проверяем URL на принадлежность к Zylalabs API
  return url.includes('zylalabs.com') || 
         url.includes('rapidapi.com') || 
         url.includes('rapidapi-prod-') ||
         url.includes('zyla-api') ||
         url.includes('api.zyla') || 
         url.includes('zylaapi') ||
         // Добавляем дополнительные домены, связанные с Zylalabs
         url.includes('zylasearch') ||
         url.includes('zylaimg') ||
         url.includes('zyla-img');
};

// Функция для проверки, является ли URL от Google Shopping
export const isGoogleShoppingImage = (url: string): boolean => {
  // Используем базовую функцию из imageService и дополняем её
  return isGoogleImageFromService(url) || 
         url.includes('encrypted-tbn') || 
         url.includes('googleusercontent') || 
         url.includes('gstatic.com/shopping');
};

// Функция для проверки, является ли URL результатом Google CSE API
export const isGoogleCseImage = (url: string): boolean => {
  return url.includes('googleusercontent.com') || 
         url.includes('gstatic.com') || 
         url.includes('ggpht.com');
};

// Функция для очистки Markdown-ссылок в URL
const cleanMarkdownUrl = (url: string): string => {
  // Если URL в формате Markdown ![alt](url)
  const markdownMatch = url.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    console.log(`Обнаружена Markdown-ссылка, извлекаем URL: ${markdownMatch[1]}`);
    return markdownMatch[1];
  }
  
  // Если простая Markdown-ссылка [text](url)
  const linkMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (linkMatch && linkMatch[1]) {
    console.log(`Обнаружена текстовая Markdown-ссылка, извлекаем URL: ${linkMatch[1]}`);
    return linkMatch[1];
  }
  
  return url;
};

// Проверка необходимости использования CORS-прокси на основе URL
const shouldUseCorsProxy = (url: string): boolean => {
  // Расширенная проверка для определения доменов с проблемами CORS
  return (
    isZylalabsImage(url) || 
    // Проверяем Google Shopping URL на необходимость использования прокси
    url.includes('encrypted-tbn') ||
    url.includes('zylaapi.') || 
    url.includes('api-zyla.') ||
    url.includes('zylasearch.') ||
    url.includes('.zylaimg.') ||
    url.includes('zyla-img.')
  );
};

// Функция для применения CORS-прокси к URL
const applyCorsProxy = (url: string): string => {
  // Используем публичный CORS-прокси
  const corsProxyUrl = 'https://corsproxy.io/?';
  
  // Не применяем прокси к URL, которые уже его используют
  if (url.startsWith('https://corsproxy.io/') || 
      url.startsWith('https://cors-anywhere.') || 
      url.startsWith('https://proxy.cors.')) {
    return url;
  }
  
  console.log(`Применяем CORS-прокси для URL: ${url}`);
  return `${corsProxyUrl}${encodeURIComponent(url)}`;
};

// Улучшенная функция для обработки изображения товара
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
    
    // Добавляем протокол, если его нет
    if (!processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
      processedUrl = `https://${processedUrl}`;
    } else if (processedUrl.startsWith('//')) {
      processedUrl = `https:${processedUrl}`;
    }
    
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
    
    // Проверяем, начинается ли URL с http или https
    if (!processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
      processedUrl = `https://${processedUrl}`;
    } else if (processedUrl.startsWith('//')) {
      processedUrl = `https:${processedUrl}`;
    }
    
    // Применяем CORS-прокси для Zylalabs изображений
    return applyCorsProxy(processedUrl);
  }
  
  // Для URL от Google CSE используем особую обработку
  if (isGoogleCseImage(processedUrl)) {
    console.log(`Обнаружен URL Google CSE: ${processedUrl}`);
    
    // Проверяем, начинается ли URL с http или https
    if (!processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
      processedUrl = `https://${processedUrl}`;
    } else if (processedUrl.startsWith('//')) {
      processedUrl = `https:${processedUrl}`;
    }
    
    return processedUrl;
  }
  
  // Проверяем необходимость использования CORS-прокси для других доменов
  if (processedUrl && shouldUseCorsProxy(processedUrl)) {
    processedUrl = applyCorsProxy(processedUrl);
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
