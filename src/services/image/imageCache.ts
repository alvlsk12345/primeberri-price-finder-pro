
/**
 * Добавляет уникальный параметр к URL изображения для избежания кэширования
 */
export const getUniqueImageUrl = (url: string, index: number): string => {
  if (!url) return '';
  
  // Добавляем параметр для обхода кэширования только для URL с расширениями изображений
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.split('?')[0]);
  
  // Если URL уже содержит параметры запроса, добавляем наш параметр к ним
  if (url.includes('?')) {
    return url + (hasImageExtension ? `&nocache=${Date.now()}-${index}` : '');
  } else {
    // Если параметров нет, добавляем наш параметр с символом ?
    return url + (hasImageExtension ? `?nocache=${Date.now()}-${index}` : '');
  }
};
