/**
 * Функции для поиска изображений через Google API
 */

// Импорт правильной функции validateGoogleApiKey
import { API_CONFIG, GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID, imageCache } from './config';
import { testMinimalGoogleApiRequest, validateGoogleApiKey } from './validator';

/**
 * Поиск изображений по запросу
 * @param query Поисковый запрос
 * @returns Массив URL изображений
 */
export async function searchImages(query: string): Promise<string[]> {
  try {
    // Валидируем API ключ перед запросом
    validateGoogleApiKey(GOOGLE_API_KEY);

    // Проверяем, есть ли изображения в кэше
    if (imageCache.has(query)) {
      console.log(`Изображения для запроса "${query}" найдены в кэше`);
      return imageCache.get(query) as string[];
    }

    // Формируем URL для запроса к Google Custom Search API
    const url = `${API_CONFIG.baseUrl}?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=${API_CONFIG.imageCount}`;
    console.log(`Выполняется запрос к Google API: ${url}`);

    // Выполняем запрос к API
    const response = await fetch(url);

    // Обрабатываем ответ
    if (!response.ok) {
      const message = `Ошибка при запросе изображений для "${query}": ${response.status} ${response.statusText}`;
      console.error(message);
      throw new Error(message);
    }

    const data = await response.json();

    // Извлекаем URL изображений из ответа
    const images = data.items ? data.items.map((item: any) => item.link) : [];
    console.log(`Найдено ${images.length} изображений для запроса "${query}"`);

    // Сохраняем изображения в кэше
    imageCache.set(query, images);

    return images;
  } catch (error) {
    console.error(`Ошибка при поиске изображений для запроса "${query}":`, error);
    throw error;
  }
}

/**
 * Поиск одного изображения по запросу
 * @param query Поисковый запрос
 * @returns URL первого найденного изображения или null
 */
export async function searchImage(query: string): Promise<string | null> {
  try {
    const images = await searchImages(query);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error(`Ошибка при поиске одного изображения для запроса "${query}":`, error);
    return null;
  }
}
