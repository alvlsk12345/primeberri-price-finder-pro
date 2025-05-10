
import { processProductImage } from "../image";
import { searchProductImageGoogle } from "./googleSearchService";
import { applyCorsProxy } from "../image/corsProxyService";

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchProductImage = async (brand: string, product: string, index: number = 0): Promise<string> => {
  try {
    console.log(`Поиск изображения для: ${brand} ${product} (индекс: ${index})`);
    
    // Используем Google CSE вместо DuckDuckGo
    const imageUrl = await searchProductImageGoogle(brand, product, index);
    
    if (imageUrl) {
      console.log(`Найдено изображение: ${imageUrl}`);
      
      // Проверяем, содержит ли URL прокси
      const hasProxy = imageUrl.includes('corsproxy.io') || 
                       imageUrl.includes('allorigins.win') || 
                       imageUrl.includes('cors-anywhere');
      
      // Обрабатываем URL изображения через обновленный processProductImage
      // Если прокси уже применен, не применяем его снова
      const processedUrl = hasProxy ? imageUrl : processProductImage(imageUrl, index);
      console.log(`Обработанный URL изображения: ${processedUrl}`);
      
      // Дополнительно проверяем, нужно ли применить CORS прокси
      if (!hasProxy && processedUrl && processedUrl.includes('googleusercontent.com')) {
        console.log(`Дополнительное применение CORS прокси для Google изображения`);
        return applyCorsProxy(processedUrl);
      }
      
      return processedUrl;
    }
    
    console.log(`Изображение не найдено для: ${brand} ${product}`);
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения:', error);
    return '';
  }
};
