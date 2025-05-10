
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { processProductImage } from "@/services/imageProcessor";
import { searchProductImage } from "@/services/api/duckduckgoService";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { callOpenAI } from "./apiClient";
import { getApiKey } from "./config";

// Функция для получения предложений брендов
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверка наличия API ключа
    const apiKey = getApiKey();
    
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к OpenAI для получения брендов...');
    
    // Специализированный промпт для получения брендов с изображениями
    const brandPrompt = `Помощник для поиска брендов и товаров: Когда пользователь вводит описание товара или запроса, система должна предложить 5 вариантов брендов и соответствующих товаров, которые могут соответствовать запросу. Для каждого бренда вывести его название, название товара, краткое описание товара и URL изображения товара на русском языке. Ответ должен содержать список из 5 брендов с их товарами, названиями товаров, короткими описаниями и ссылками на изображения. Формат: 'Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание товара], Изображение: [URL изображения товара]'.

Запрос пользователя: "${description}"`;

    // Получаем ответ от API
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.5,
      max_tokens: 600
    });

    if (!content) {
      throw new Error('Пустой ответ от API');
    }

    // Парсинг ответа в формате "Бренд: X, Товар: Y, Описание: Z, Изображение: URL"
    const suggestions: BrandSuggestion[] = [];
    
    // Разделяем ответ на строки и извлекаем данные
    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
    
    for (const line of lines) {
      try {
        const brandMatch = line.match(/Бренд:\s*([^,]+)/i);
        const productMatch = line.match(/Товар:\s*([^,]+)/i);
        const descriptionMatch = line.match(/Описание:\s*([^,]+)/i);
        const imageMatch = line.match(/Изображение:\s*(.+)/i);
        
        if (brandMatch && productMatch && descriptionMatch) {
          const brand = brandMatch[1].trim();
          const product = productMatch[1].trim();
          const description = descriptionMatch[1].trim();
          const openaiImageUrl = imageMatch ? imageMatch[1].trim() : undefined;
          
          // Обработка изображения или поиск через DuckDuckGo при необходимости
          const processedImageUrl = await processImageWithFallback(
            openaiImageUrl, 
            brand,
            product, 
            suggestions.length
          );
          
          suggestions.push({
            brand,
            product,
            description,
            imageUrl: processedImageUrl
          });
        }
      } catch (error) {
        console.error('Ошибка при парсинге строки:', line, error);
      }
    }

    // Если у нас нет 5 результатов, возвращаем то что есть
    return suggestions.slice(0, 5);

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI для брендов:', error);
    throw error;
  }
};

/**
 * Функция для обработки изображения с запасными вариантами
 * @param imageUrl URL изображения от OpenAI
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникального обращения к API
 * @returns URL обработанного изображения
 */
async function processImageWithFallback(
  imageUrl: string | undefined, 
  brand: string,
  product: string,
  index: number
): Promise<string> {
  try {
    // Пробуем использовать URL от OpenAI, если он предоставлен
    if (imageUrl) {
      // Обработка изображения с помощью processProductImage
      const processedUrl = processProductImage(imageUrl, index);
      
      // Если обработка прошла успешно и URL не пустой
      if (processedUrl) {
        console.log(`Используем изображение из OpenAI для ${brand} ${product}`);
        return processedUrl;
      }
    }
    
    // Если URL от OpenAI недоступен или пуст, пробуем найти через DuckDuckGo
    console.log(`Поиск изображения через DuckDuckGo для ${brand} ${product}`);
    const ddgImageUrl = await searchProductImage(brand, product, index);
    
    if (ddgImageUrl) {
      console.log(`Найдено изображение через DuckDuckGo для ${brand}`);
      return ddgImageUrl;
    }
    
    // Если оба метода не сработали, используем заглушку
    console.log(`Используем заглушку для ${brand}`);
    return getPlaceholderImageUrl(brand);
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    // В случае ошибки возвращаем заглушку
    return getPlaceholderImageUrl(brand);
  }
}
