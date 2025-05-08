
// Функции для работы с изображениями

// Проверка валидности URL изображения
export const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  // Разрешаем URL изображений от Google Shopping (encrypted-tbn)
  if (url.includes('encrypted-tbn')) {
    return true;
  }
  
  // Базовая валидация URL
  try {
    new URL(url);
    
    // Проверка расширений файлов изображений
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Проверка на содержание ключевых слов для изображений
    const imageKeywords = ['image', 'img', 'photo', 'picture', 'product'];
    const hasImageKeyword = imageKeywords.some(keyword => url.toLowerCase().includes(keyword));
    
    return hasImageExtension || hasImageKeyword || url.includes('cdn') || url.includes('media');
  } catch (e) {
    console.error('Невалидный URL:', e);
    return false;
  }
};

// Добавление уникальных параметров к URL для предотвращения кеширования
export const getUniqueImageUrl = (url: string, index: number): string => {
  try {
    // Проверка на пустой URL
    if (!url) return '';
    
    // Проверяем, содержит ли URL encrypted-tbn (Google Shopping)
    // В этом случае нам нужно использовать URL как есть
    if (url.includes('encrypted-tbn')) {
      return url;
    }
    
    // Для других URL добавляем уникальный параметр
    const uniqueParam = `lovable_nocache=${Date.now()}-${index}`;
    const urlObj = new URL(url);
    urlObj.searchParams.append(uniqueParam.split('=')[0], uniqueParam.split('=')[1]);
    return urlObj.toString();
  } catch (e) {
    console.error('Ошибка при обработке URL изображения:', e, url);
    // В случае ошибки возвращаем исходный URL
    return url;
  }
};

// Получение доменного имени из URL
export const getDomainFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    // Удаляем www. из начала домена, если оно есть
    return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  } catch (e) {
    return '';
  }
};
