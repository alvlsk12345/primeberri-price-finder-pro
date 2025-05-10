
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
  // Используем Google CSE вместо DuckDuckGo
  return await searchProductImageGoogle(brand, product, index);
};
