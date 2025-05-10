
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
    console.log(`----- ПОИСК ИЗОБРАЖЕНИЯ В duckduckgoService -----`);
    console.log(`Бренд: "${brand}", Продукт: "${product}", Индекс: ${index}`);
    
    // Используем Google CSE вместо DuckDuckGo
    console.log('Перенаправление запроса к Google CSE...');
    const imageUrl = await searchProductImageGoogle(brand, product, index);
    
    if (imageUrl) {
      console.log(`Успешно получен URL изображения: ${imageUrl}`);
      
      // Проверяем, содержит ли URL прокси
      const hasProxy = imageUrl.includes('corsproxy.io') || 
                       imageUrl.includes('allorigins.win') || 
                       imageUrl.includes('cors-anywhere');
      
      console.log(`URL содержит прокси: ${hasProxy}`);
      
      // Обрабатываем URL изображения через обновленный processProductImage
      // Если прокси уже применен, не применяем его снова
      const processedUrl = hasProxy ? imageUrl : processProductImage(imageUrl, index);
      console.log(`Обработанный URL изображения: ${processedUrl}`);
      
      // Дополнительно проверяем, нужно ли применить CORS прокси
      if (!hasProxy && processedUrl && processedUrl.includes('googleusercontent.com')) {
        console.log(`Дополнительное применение CORS прокси для Google изображения`);
        const proxiedUrl = applyCorsProxy(processedUrl);
        console.log(`URL с применённым прокси: ${proxiedUrl}`);
        return proxiedUrl;
      }
      
      return processedUrl;
    }
    
    console.log(`Изображение не найдено для: ${brand} ${product}`);
    return '';
  } catch (error) {
    console.error('ОШИБКА ПРИ ПОИСКЕ ИЗОБРАЖЕНИЯ:', error);
    // Более детальное логирование ошибки
    console.error('ТИП ОШИБКИ:', error.name);
    console.error('СООБЩЕНИЕ:', error.message);
    console.error('СТЕК:', error.stack);
    return '';
  }
};
