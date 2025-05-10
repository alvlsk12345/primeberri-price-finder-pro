
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
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
    
    // Оптимизированный промпт для более быстрого получения результатов
    const brandPrompt = `Предложи 3 бренда товаров, соответствующих запросу пользователя. Для каждого бренда укажи: название бренда, название конкретной модели товара, краткое описание товара в одно предложение. Формат ответа строго: 'Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание]'. Ответ должен содержать ровно 3 строки, по одной на каждый бренд.

Запрос пользователя: "${description}"`;

    // Получаем ответ от API с уменьшенным количеством токенов
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.5,
      max_tokens: 300 // Сокращаем количество токенов для ускорения
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
          
          // Поиск изображения через Google CSE
          console.log(`Поиск изображения для ${brand} ${product} через Google CSE`);
          let imageUrl;
          try {
            imageUrl = await searchProductImageGoogle(brand, product, suggestions.length);
          } catch (imageError) {
            console.error("Ошибка при поиске изображения:", imageError);
            // В случае ошибки поиска изображения используем заполнитель
            imageUrl = getPlaceholderImageUrl(brand);
          }
          
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

    // Если не удалось получить предложения, создаем демо-данные
    if (suggestions.length === 0) {
      return createMockBrandSuggestions(description);
    }

    // Возвращаем найденные предложения (до 3 результатов)
    return suggestions.slice(0, 3);

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI для брендов:', error);
    // В случае любой ошибки возвращаем демо-данные
    return createMockBrandSuggestions(description);
  }
};

// Функция для создания имитационных данных о брендах на основе описания
function createMockBrandSuggestions(description: string): BrandSuggestion[] {
  const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1);
  
  return [
    {
      brand: "BrandPrime",
      product: `${capitalizedDescription} Pro`,
      description: `Высококачественный ${description} с превосходными характеристиками и стильным дизайном.`,
      imageUrl: `https://placehold.co/600x400?text=BrandPrime+${encodeURIComponent(description)}`
    },
    {
      brand: "EcoStyle",
      product: `Eco${capitalizedDescription}`,
      description: `Экологичный ${description} из переработанных материалов с отличными функциями.`,
      imageUrl: `https://placehold.co/600x400?text=EcoStyle+${encodeURIComponent(description)}`
    },
    {
      brand: "TechSolutions",
      product: `Smart${capitalizedDescription}`,
      description: `Инновационный ${description} с интеллектуальными функциями и современным дизайном.`,
      imageUrl: `https://placehold.co/600x400?text=TechSolutions+${encodeURIComponent(description)}`
    }
  ];
}
