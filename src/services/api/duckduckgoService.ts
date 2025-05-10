
import { processProductImage } from "../image";
import { searchProductImageGoogle } from "./googleSearchService";
import { getPlaceholderImageUrl } from "../image/imagePlaceholder";

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или заглушку в случае ошибки
 */
export const searchProductImage = async (brand: string, product: string, index: number = 0): Promise<string> => {
  try {
    console.log(`Поиск изображения для: ${brand} ${product}`);
    
    // Используем Google CSE вместо DuckDuckGo
    const imageUrl = await searchProductImageGoogle(brand, product, index);
    
    if (imageUrl) {
      console.log(`Найдено изображение: ${imageUrl}`);
      // Обрабатываем URL изображения через обновленный processProductImage
      const processedUrl = processProductImage(imageUrl, index);
      console.log(`Обработанный URL изображения: ${processedUrl}`);
      return processedUrl;
    }
    
    console.log(`Изображение не найдено для: ${brand} ${product}`);
    // Возвращаем заглушку вместо пустой строки
    return getPlaceholderImageUrl(`${brand} ${product}`);
  } catch (error) {
    console.error('Ошибка при поиске изображения:', error);
    // Возвращаем заглушку вместо пустой строки
    return getPlaceholderImageUrl(`${brand} ${product}`);
  }
};
