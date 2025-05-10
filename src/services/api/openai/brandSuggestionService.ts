
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
    const brandPrompt = `Помощник для поиска брендов и товаров: Когда пользователь вводит описание товара или запроса, система должна предложить 5 вариантов брендов и соответствующих товаров, которые могут соответствовать запросу. Для каждого бренда вывести его название, название товара, краткое описание товара. НЕ ВОЗВРАЩАЙТЕ ИЗОБРАЖЕНИЯ И ССЫЛКИ! Ответ должен содержать список из 5 брендов с их товарами, названиями товаров и короткими описаниями. Формат: 'Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание товара]'.

Запрос пользователя: "${description}"`;

    // Получаем ответ от API
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.5,
      max_tokens: 600
    });

    if (!content) {
      throw new Error('Пустой ответ от API');
    }

    // Парсинг ответа в формате "Бренд: X, Товар: Y, Описание: Z"
    const suggestions: BrandSuggestion[] = [];
    
    // Разделяем ответ на строки и извлекаем данные
    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
    
    for (const line of lines) {
      try {
        const brandMatch = line.match(/Бренд:\s*([^,]+)/i);
        const productMatch = line.match(/Товар:\s*([^,]+)/i);
        const descriptionMatch = line.match(/Описание:\s*(.+)/i);
        
        if (brandMatch && productMatch && descriptionMatch) {
          const brand = brandMatch[1].trim();
          const product = productMatch[1].trim();
          const description = descriptionMatch[1].trim();
          
          // Сразу ищем изображение через DuckDuckGo
          console.log(`Поиск изображения для ${brand} ${product} через DuckDuckGo`);
          const imageUrl = await searchProductImage(brand, product, suggestions.length);
          
          suggestions.push({
            brand,
            product,
            description,
            imageUrl: imageUrl || getPlaceholderImageUrl(brand)
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
