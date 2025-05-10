
import { processProductImage } from "../imageProcessor";

// Кэш для хранения результатов поиска изображений
const imageCache: Record<string, string> = {};

/**
 * Функция для поиска изображения через DuckDuckGo API
 * @param query Запрос для поиска изображения (например, "бренд продукт")
 * @param index Индекс для генерации уникального изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchImageDuckDuckGo = async (query: string, index: number = 0): Promise<string> => {
  try {
    // Проверяем кэш перед выполнением запроса
    const cacheKey = `${query.toLowerCase()}_${index}`;
    if (imageCache[cacheKey]) {
      console.log(`Изображение найдено в кэше для запроса: ${query}`);
      return imageCache[cacheKey];
    }

    console.log(`Поиск изображения через DuckDuckGo для: ${query}`);
    
    // Формируем URL для запроса к неофициальному DuckDuckGo API
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://duckduckgo.com/i.js?q=${encodedQuery}&o=json`;
    
    // Добавляем случайный параметр для обхода кэширования
    const urlWithNocache = `${apiUrl}&nocache=${Date.now()}`;
    
    // Выполняем запрос к API
    const response = await fetch(urlWithNocache);
    
    if (!response.ok) {
      console.error(`Ошибка запроса DuckDuckGo API: ${response.status}`);
      return '';
    }
    
    const data = await response.json();
    
    // Проверяем, есть ли результаты в ответе
    if (data && data.results && data.results.length > 0) {
      // Всегда берем первое (наиболее релевантное) изображение вместо случайного
      const imageUrl = data.results[0]?.image;
      
      if (imageUrl) {
        // Обрабатываем URL изображения через нашу существующую функцию
        const processedUrl = processProductImage(imageUrl, index);
        
        // Сохраняем результат в кэше
        imageCache[cacheKey] = processedUrl;
        
        console.log(`Найдено изображение через DuckDuckGo: ${processedUrl}`);
        return processedUrl;
      }
    }
    
    console.log(`DuckDuckGo не вернул изображений для запроса: ${query}`);
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения через DuckDuckGo:', error);
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
export const searchProductImage = async (brand: string, product: string, index: number = 0): Promise<string> => {
  // Формируем запрос из бренда и продукта
  const query = `${brand} ${product}`;
  
  // Ищем изображение по запросу
  return await searchImageDuckDuckGo(query, index);
};
