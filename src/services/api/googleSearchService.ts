
import { processProductImage } from "../image";

// API ключ для Google Custom Search API
const GOOGLE_API_KEY = 'AIzaSyATUUTV--YXzsWskw--7j2CUNlU70zT4QQ';
// ID поисковой системы
const GOOGLE_SEARCH_ENGINE_ID = 'e52af8ec5dbe646c8';

// Кэш для хранения результатов поиска изображений
const imageCache: Record<string, string> = {};

/**
 * Функция для поиска изображения через Google Custom Search API
 * @param query Запрос для поиска изображения (например, "бренд продукт")
 * @param index Индекс для генерации уникального изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchImageGoogleCSE = async (query: string, index: number = 0): Promise<string> => {
  try {
    // Проверяем кэш перед выполнением запроса
    const cacheKey = `${query.toLowerCase()}_${index}`;
    if (imageCache[cacheKey]) {
      console.log(`Изображение найдено в кэше для запроса: ${query}`);
      return imageCache[cacheKey];
    }

    console.log(`Поиск изображения через Google CSE для: ${query}`);
    
    // Формируем URL для запроса к Google Custom Search API
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodedQuery}&searchType=image&num=5`;
    
    // Выполняем запрос к API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Ошибка запроса Google CSE API: ${response.status}`);
      return '';
    }
    
    const data = await response.json();
    
    // Проверяем, есть ли результаты в ответе
    if (data && data.items && data.items.length > 0) {
      // Выбираем изображение на основе индекса (если доступно) или берём первое
      const imageItem = data.items[Math.min(index, data.items.length - 1)] || data.items[0];
      const imageUrl = imageItem.link;
      
      if (imageUrl) {
        // Обрабатываем URL изображения через нашу существующую функцию
        const processedUrl = processProductImage(imageUrl, index);
        
        // Сохраняем результат в кэше
        imageCache[cacheKey] = processedUrl;
        
        console.log(`Найдено изображение через Google CSE: ${processedUrl}`);
        return processedUrl;
      }
    }
    
    console.log(`Google CSE не вернул изображений для запроса: ${query}`);
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения через Google CSE:', error);
    return '';
  }
};

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchProductImageGoogle = async (brand: string, product: string, index: number = 0): Promise<string> => {
  // Формируем запрос из бренда и продукта
  const query = `${brand} ${product}`;
  
  // Ищем изображение по запросу
  return await searchImageGoogleCSE(query, index);
};

