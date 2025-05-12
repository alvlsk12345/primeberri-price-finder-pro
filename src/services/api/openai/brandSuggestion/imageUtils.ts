
import { searchProductImageGoogle } from "@/services/api/googleSearch";
import { getPlaceholderImageUrl, getBrandPlaceholderImageUrl } from "@/services/image/imagePlaceholder";
import { applyCorsProxy } from "@/services/image/corsProxyService";

// Локальное кэширование изображений
const imageCache: Record<string, string> = {};

// Поиск изображения для продукта с таймаутом и кэшированием
export async function findProductImage(brand: string, product: string, index: number): Promise<string> {
  try {
    if (!brand && !product) {
      console.warn('Ни бренд, ни продукт не указаны для поиска изображения');
      return getPlaceholderImageUrl('unknown');
    }
    
    // Используем бренд+продукт для поиска, но если продукт не задан - только бренд
    const searchQuery = product ? `${brand} ${product}` : brand;
    console.log(`Поиск изображения для запроса: "${searchQuery}" (индекс: ${index})`);
    
    // Создаем ключ кэша с очисткой от специальных символов
    const cacheKey = `img_${searchQuery}_${index}`
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-zа-я0-9_]/gi, '');
    
    // Проверяем локальный кэш в памяти (более быстрый доступ)
    if (imageCache[cacheKey]) {
      console.log(`Найдено кэшированное изображение в памяти для ${searchQuery}`);
      return imageCache[cacheKey];
    }
    
    // Проверяем кэш в localStorage
    try {
      const cachedImage = localStorage.getItem(cacheKey);
      if (cachedImage) {
        console.log(`Найдено кэшированное изображение в localStorage для ${searchQuery}`);
        // Сохраняем также в локальный кэш для ускорения последующих запросов
        imageCache[cacheKey] = cachedImage;
        return cachedImage;
      }
    } catch (e) {
      console.warn("Ошибка доступа к localStorage:", e);
    }
    
    // Предварительные изображения для часто запрашиваемых продуктов
    if (searchQuery.toLowerCase().includes('ixpand flash drive')) {
      const preloadedUrl = "https://m.media-amazon.com/images/I/71eOcyYJmHL._AC_SL1500_.jpg";
      cacheImage(cacheKey, preloadedUrl);
      return preloadedUrl;
    }
    
    if (searchQuery.toLowerCase().includes('nokia 3310') || searchQuery.toLowerCase() === 'nokia') {
      const preloadedUrl = "https://m.media-amazon.com/images/I/61TM6Q+9AyL._AC_SL1500_.jpg";
      cacheImage(cacheKey, preloadedUrl);
      return preloadedUrl;
    }
    
    // Поиск изображения с ограничением времени
    const imagePromise = searchProductImageGoogle(brand, product || brand, index);
    
    // Устанавливаем таймаут для поиска изображения (8 секунд)
    const timeoutPromise = new Promise<string | null>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    
    // Используем Race для ограничения времени выполнения
    let imageUrl: string;
    try {
      imageUrl = await Promise.race([imagePromise, timeoutPromise]) || '';
    } catch (timeoutError) {
      console.warn(`Превышено время поиска изображения для ${searchQuery}:`, timeoutError);
      return getBrandPlaceholderImageUrl(brand);
    }
    
    if (imageUrl) {
      // Применяем CORS прокси к URL изображения при необходимости
      const processedUrl = applyCorsProxy(imageUrl);
      console.log(`Найдено изображение: ${processedUrl}`);
      
      // Сохраняем в кэш
      cacheImage(cacheKey, processedUrl);
      return processedUrl;
    } else {
      console.warn(`Изображение не найдено для ${searchQuery}, используем заглушку с брендом`);
      return getBrandPlaceholderImageUrl(brand);
    }
  } catch (imageError) {
    console.error("Ошибка при поиске изображения:", imageError);
    // В случае ошибки поиска изображения используем заполнитель с брендом
    return getBrandPlaceholderImageUrl(brand || 'unknown');
  }
}

// Вспомогательная функция для кэширования изображений
function cacheImage(key: string, url: string): void {
  // Сохраняем в оба кэша
  imageCache[key] = url;
  
  try {
    localStorage.setItem(key, url);
  } catch (e) {
    console.warn("Не удалось сохранить изображение в localStorage:", e);
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
