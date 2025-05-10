
import { processProductImage } from "../imageProcessor";
import { searchProductImageGoogle } from "./googleSearchService";

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchProductImage = async (brand: string, product: string, index: number = 0): Promise<string> => {
  try {
    // Используем Google CSE вместо DuckDuckGo
    const imageUrl = await searchProductImageGoogle(brand, product, index);
    if (imageUrl) {
      return processProductImage(imageUrl, index); // Обрабатываем URL изображения
    }
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения:', error);
    return '';
  }
};
