
import { API_CONFIG, GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID, imageCache } from './config';

/**
 * Интерфейс для элемента изображения в ответе Google API
 */
interface GoogleImageItem {
  link: string;
  image?: {
    thumbnailLink?: string;
  };
}

/**
 * Функция для поиска изображений товаров с использованием Google Custom Search API
 * @param query - поисковый запрос
 * @param maxResults - максимальное количество результатов
 * @returns массив URL изображений
 */
export const searchProductImages = async (query: string, maxResults: number = 5): Promise<string[]> => {
  // Проверяем кеш
  const cacheKey = `img_${query}`;
  if (imageCache.has(cacheKey)) {
    console.log(`Используем кешированные изображения для запроса: ${query}`);
    return imageCache.get(cacheKey) || [];
  }

  try {
    console.log(`Поиск изображений для запроса: ${query}`);
    
    // Формируем URL для запроса к API
    const url = new URL(API_CONFIG.BASE_URL);
    url.searchParams.append('key', GOOGLE_API_KEY);
    url.searchParams.append('cx', GOOGLE_SEARCH_ENGINE_ID);
    url.searchParams.append('q', query);
    url.searchParams.append('searchType', 'image');
    url.searchParams.append('num', String(maxResults));
    url.searchParams.append('imgSize', 'medium');
    url.searchParams.append('safe', 'active');
    
    // Делаем запрос к API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка API Google: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const items = data.items || [];
    
    // Извлекаем ссылки на изображения
    const imageUrls = items
      .map((item: GoogleImageItem) => item.link)
      .filter((url: string) => url && url.startsWith('http'));
    
    // Сохраняем в кеш
    if (imageUrls.length > 0) {
      imageCache.set(cacheKey, imageUrls);
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Ошибка при поиске изображений:', error);
    return [];
  }
};

export const searchProductImageGoogle = async (query: string): Promise<string | null> => {
  const images = await searchProductImages(`${query} product`, 3);
  return images.length > 0 ? images[0] : null;
};
