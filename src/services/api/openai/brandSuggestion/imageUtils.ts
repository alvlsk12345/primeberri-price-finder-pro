
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { applyCorsProxy } from "@/services/image/corsProxyService";

// Поиск изображения для продукта с таймаутом и кэшированием
export async function findProductImage(brand: string, product: string, index: number): Promise<string> {
  try {
    console.log(`Поиск изображения для ${brand} ${product} через Google CSE`);
    
    // Создаем ключ кэша
    const cacheKey = `img_${brand}_${product}_${index}`.toLowerCase().replace(/\s+/g, '_');
    
    // Проверяем кэш
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      console.log(`Найдено кэшированное изображение для ${brand} ${product}`);
      return cachedImage;
    }
    
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
      
      // Сохраняем в кэш
      try {
        localStorage.setItem(cacheKey, processedUrl);
      } catch (e) {
        console.warn("Не удалось сохранить изображение в кэш:", e);
      }
      
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
