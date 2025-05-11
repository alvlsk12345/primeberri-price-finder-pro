
/**
 * Функции для форматирования URL изображений
 */

/**
 * Очищает URL от возможной Markdown разметки
 */
export const cleanMarkdownUrl = (url: string): string => {
  if (!url) return '';
  
  // Удаляем Markdown разметку изображений ![alt](url)
  const markdownMatch = url.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }
  
  // Удаляем Markdown разметку ссылок [text](url)
  const linkMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (linkMatch && linkMatch[1]) {
    return linkMatch[1];
  }
  
  return url;
};

/**
 * Форматирует URL изображения, добавляя протокол если нужно,
 * обрабатывает относительные URL и другие специальные случаи
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return '';
  
  let formattedUrl = url.trim();
  
  // Добавляем протокол если отсутствует и это не data URL
  if (!formattedUrl.startsWith('http') && !formattedUrl.startsWith('data:') && !formattedUrl.startsWith('//')) {
    // Если URL начинается с //, добавляем https:
    if (formattedUrl.startsWith('//')) {
      formattedUrl = `https:${formattedUrl}`;
    } else {
      formattedUrl = `https://${formattedUrl}`;
    }
  }
  
  // Удаляем экранирование слешей
  formattedUrl = formattedUrl.replace(/\\\//g, '/');
  
  // Удаляем кавычки из URL, если они есть в начале и конце
  if (formattedUrl.startsWith('"') && formattedUrl.endsWith('"')) {
    formattedUrl = formattedUrl.substring(1, formattedUrl.length - 1);
  }
  
  return formattedUrl;
};
