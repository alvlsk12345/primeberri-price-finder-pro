
import { searchProductImageGoogle } from "@/services/api/googleSearch";
import { getPlaceholderImageUrl, getBrandPlaceholderImageUrl } from "@/services/image/imagePlaceholder";
import { applyCorsProxy } from "@/services/image/corsProxyService";

/**
 * Находит изображение для продукта, сначала пытаясь использовать API Google,
 * а если это не удаётся, возвращает заглушку.
 * 
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для кеширования
 * @returns URL изображения
 */
export const findProductImage = async (
  brand: string,
  product: string,
  index: number
): Promise<string> => {
  const query = `${brand} ${product}`;
  
  try {
    // Сначала пытаемся получить изображение через Google API
    const imageUrl = await searchProductImageGoogle(query);
    
    if (imageUrl) {
      // Обрабатываем URL изображения через прокси для обхода CORS
      return applyCorsProxy(imageUrl);
    }
  } catch (error) {
    console.error(`Не удалось загрузить изображение для ${query}:`, error);
  }
  
  // Если не удалось найти изображение, используем заглушку на основе бренда
  return index % 3 === 0 
    ? getBrandPlaceholderImageUrl(brand) 
    : getPlaceholderImageUrl();
};
