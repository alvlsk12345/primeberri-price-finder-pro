import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { getPlaceholderImageUrl } from "@/services/image/imagePlaceholder";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { callOpenAI } from "./apiClient";
import { getApiKey } from "./config";
import { processProductImage } from "@/services/image";

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
          
          // Создаем сначала заглушку, чтобы интерфейс отрисовался быстрее
          const placeholderUrl = getPlaceholderImageUrl(brand);
          
          // Добавляем предложение с заглушкой
          const suggestionIndex = suggestions.length;
          suggestions.push({
            brand,
            product,
            description,
            imageUrl: placeholderUrl
          });
          
          // Асинхронно ищем изображение, не блокируя основной поток
          searchProductImageGoogle(brand, product, suggestionIndex).then(imageUrl => {
            // Если нашли изображение, обновляем предлож��ние
            if (imageUrl && suggestionIndex < suggestions.length) {
              suggestions[suggestionIndex].imageUrl = processProductImage(imageUrl, suggestionIndex);
            }
          }).catch(err => {
            console.error("Ошибка при асинхронном поиске изображения:", err);
            // Заглушка уже установлена, ничего не делаем
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
  
  // Используем локальные SVG вместо внешнего placehold.co
  return [
    {
      brand: "BrandPrime",
      product: `${capitalizedDescription} Pro`,
      description: `Высококачественный ${description} с превосходными характеристиками и стильным дизайном.`,
      imageUrl: getPlaceholderImageUrl("BrandPrime")
    },
    {
      brand: "EcoStyle",
      product: `Eco${capitalizedDescription}`,
      description: `Экологичный ${description} из переработанных материалов с отличными функциями.`,
      imageUrl: getPlaceholderImageUrl("EcoStyle")
    },
    {
      brand: "TechSolutions",
      product: `Smart${capitalizedDescription}`,
      description: `Инновационный ${description} с интеллектуальными функциями и современным дизайном.`,
      imageUrl: getPlaceholderImageUrl("TechSolutions")
    }
  ];
}
