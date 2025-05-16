
/**
 * Функции для валидации URL изображений
 */

/**
 * Проверяет, является ли строка валидным URL изображения
 * @param url URL для проверки
 * @returns true если URL валиден, false в противном случае
 */
export const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;

  // Удаляем пробелы в начале и конце строки
  const trimmedUrl = url.trim();
  
  // Проверяем data URLs (начинаются с data:image)
  if (trimmedUrl.startsWith('data:image/')) {
    return true;
  }
  
  // Проверяем, что URL начинается с http:// или https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    console.log(`Невалидный URL изображения (не начинается с http/https): ${trimmedUrl.substring(0, 50)}...`);
    return false;
  }
  
  // Проверяем базовую структуру URL
  try {
    new URL(trimmedUrl);
    return true;
  } catch (e) {
    console.error(`Ошибка разбора URL: ${trimmedUrl.substring(0, 50)}...`, e);
    return false;
  }
};

/**
 * Проверяет, является ли строка URL изображения с поддерживаемым расширением файла
 * @param url URL для проверки
 * @returns true если URL имеет поддерживаемое расширение, false в противном случае
 */
export const hasImageExtension = (url: string | null): boolean => {
  if (!url) return false;
  
  // Список распространенных расширений файлов изображений
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.ico', '.heic', '.heif'];
  
  const lowercaseUrl = url.toLowerCase();
  
  // Проверяем, заканчивается ли URL одним из поддерживаемых расширений
  return imageExtensions.some(ext => {
    const hasExtension = lowercaseUrl.endsWith(ext) || lowercaseUrl.includes(`${ext}?`);
    
    // Если нашли расширение, возвращаем true
    if (hasExtension) {
      return true;
    }
    
    return false;
  });
};
