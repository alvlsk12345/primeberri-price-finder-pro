
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { applyCorsProxy } from "@/services/image/corsProxyService";

// Поиск изображения для продукта с таймаутом
export async function findProductImage(brand: string, product: string, index: number): Promise<string> {
  try {
    console.log(`Поиск изображения для ${brand} ${product} через Google CSE`);
    
    // Поиск изображения с ограничением времени
    const imagePromise = searchProductImageGoogle(brand, product, index);
    
    // Устанавливаем таймаут для поиска изображения
    const timeoutPromise = new Promise<string | null>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    // Используем Race для ограничения времени выполнения
    const imageUrl = await Promise.race([imagePromise, timeoutPromise]);
    
    if (imageUrl) {
      // Применяем CORS прокси к URL изображения при необходимости
      const processedUrl = applyCorsProxy(imageUrl);
      console.log(`Найдено изображение: ${processedUrl}`);
      return processedUrl;
    } else {
      console.warn(`Изображение не найдено для ${brand} ${product}, используем плейсхолдер`);
      return getPlaceholderImageUrl(brand);
    }
  } catch (imageError) {
    console.error("Ошибка при поиске изображения:", imageError);
    // В случае ошибки поиска изображения используем заполнитель
    return getPlaceholderImageUrl(brand);
  }
}
