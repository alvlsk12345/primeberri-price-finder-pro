
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { applyCorsProxy } from "@/services/image/corsProxyService";

// Локальное кэширование изображений
const imageCache: Record<string, string> = {};

// Поиск изображения для продукта с таймаутом и кэшированием
export async function findProductImage(brand: string, product: string, index: number): Promise<string> {
  try {
    if (!brand) {
      console.warn('Бренд не указан для поиска изображения');
      return getPlaceholderImageUrl('unknown');
    }
    
    console.log(`Поиск изображения для ${brand} ${product} через Google CSE (индекс: ${index})`);
    
    // Создаем ключ кэша
    const cacheKey = `img_${brand}_${product}_${index}`.toLowerCase().replace(/\s+/g, '_');
    
    // Проверяем локальный кэш в памяти (более быстрый доступ)
    if (imageCache[cacheKey]) {
      console.log(`Найдено кэшированное изображение в памяти для ${brand} ${product}`);
      return imageCache[cacheKey];
    }
    
    // Проверяем кэш в localStorage
    try {
      const cachedImage = localStorage.getItem(cacheKey);
      if (cachedImage) {
        console.log(`Найдено кэшированное изображение в localStorage для ${brand} ${product}`);
        // Сохраняем также в локальный кэш для ускорения последующих запросов
        imageCache[cacheKey] = cachedImage;
        return cachedImage;
      }
    } catch (e) {
      console.warn("Ошибка доступа к localStorage:", e);
    }
    
    // Поиск изображения с ограничением времени
    const imagePromise = searchProductImageGoogle(brand, product, index);
    
    // Устанавливаем таймаут для поиска изображения (8 секунд)
    const timeoutPromise = new Promise<string | null>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    // Используем Race для ограничения времени выполнения
    const imageUrl = await Promise.race([imagePromise, timeoutPromise]);
    
    if (imageUrl) {
      // Применяем CORS прокси к URL изображения при необходимости
      const processedUrl = applyCorsProxy(imageUrl);
      console.log(`Найдено изображение: ${processedUrl}`);
      
      // Сохраняем в оба кэша
      imageCache[cacheKey] = processedUrl;
      
      try {
        localStorage.setItem(cacheKey, processedUrl);
      } catch (e) {
        console.warn("Не удалось сохранить изображение в localStorage:", e);
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

// Экспортируем функцию для очистки кэша изображений (может пригодиться)
export function clearImageCache(): void {
  Object.keys(imageCache).forEach(key => {
    if (key.startsWith('img_')) {
      delete imageCache[key];
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Не удалось удалить ${key} из localStorage:`, e);
      }
    }
  });
  console.log('Кэш изображений очищен');
}
