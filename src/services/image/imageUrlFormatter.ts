
/**
 * Очищает Markdown-ссылки в URL
 */
export const cleanMarkdownUrl = (url: string): string => {
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

/**
 * Форматирует URL изображения (добавляет протокол, обрабатывает относительные URL)
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return '';
  
  let processedUrl = url;
  
  // Добавляем протокол, если его нет
  if (!processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
    processedUrl = `https://${processedUrl}`;
    console.log(`Добавлен протокол https: ${processedUrl}`);
  }
  
  // Преобразуем относительные URL в абсолютные
  if (processedUrl.startsWith('//')) {
    processedUrl = `https:${processedUrl}`;
    console.log(`Преобразован относительный URL: ${processedUrl}`);
  }
  
  return processedUrl;
};
