
/**
 * Декодирует URL из base64 формата
 * @param base64Url URL в формате base64
 * @returns Декодированный URL
 */
export function decodeBase64Url(base64Url: string): string {
  try {
    return atob(base64Url.replace(/_/g, "/").replace(/-/g, "+"));
  } catch (error) {
    console.error("Base64 decode error:", error);
    return "";
  }
}

/**
 * Кодирует URL в base64 формат
 * @param url URL для кодирования
 * @returns URL в формате base64
 */
export function encodeBase64Url(url: string): string {
  try {
    return btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
  } catch (error) {
    console.error("Base64 encode error:", error);
    return "";
  }
}

/**
 * Создает хеш для URL
 * @param url URL для хеширования
 * @returns Хеш URL
 */
export function hashUrl(url: string): string {
  let hash = 0;
  if (url.length === 0) return hash.toString(16);
  
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Форматирует размер файла в удобочитаемую строку
 * @param bytes Размер в байтах
 * @returns Форматированная строка размера
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + " MB";
  const gb = mb / 1024;
  return gb.toFixed(2) + " GB";
}

/**
 * Определяет, является ли URL изображением по расширению или заголовку Content-Type
 * @param url URL для проверки
 * @param contentType Content-Type заголовок (опционально)
 * @returns true, если URL указывает на изображение
 */
export function isImage(url: string, contentType?: string | null): boolean {
  if (contentType && contentType.startsWith('image/')) {
    return true;
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

/**
 * Получает расширение файла из URL или Content-Type
 * @param url URL изображения
 * @param contentType Content-Type заголовок
 * @returns Расширение файла с точкой
 */
export function getFileExtensionFromUrl(url: string, contentType: string | null): string {
  // Пытаемся получить расширение из URL
  const urlMatch = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  if (urlMatch) {
    return '.' + urlMatch[1].toLowerCase();
  }
  
  // Если нет расширения, определяем по Content-Type
  if (contentType) {
    switch (contentType) {
      case 'image/jpeg': return '.jpg';
      case 'image/png': return '.png';
      case 'image/gif': return '.gif';
      case 'image/webp': return '.webp';
      case 'image/svg+xml': return '.svg';
      case 'image/bmp': return '.bmp';
    }
  }
  
  // По умолчанию используем .jpg
  return '.jpg';
}
