
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
    
    // Улучшенный промпт с более строгими требованиями к формату ответа
    const brandPrompt = `Предложи 3 популярных бренда товаров, соответствующих запросу пользователя.
    
    ВАЖНО: Для каждого бренда ОБЯЗАТЕЛЬНО укажи:
    1. Название бренда (реальный существующий бренд)
    2. Название конкретного товара этого бренда
    3. Краткое описание товара в одно предложение
    
    Формат ответа СТРОГО следующий (без отклонений):
    Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание]
    
    Ответ должен содержать ровно 3 строки, по одной строке на каждый бренд.
    
    Запрос пользователя: "${description}"`;

    // Получаем ответ от API с оптимизированными параметрами
    console.log('Отправляем промпт к OpenAI:', brandPrompt);
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.7,
      max_tokens: 350
    });

    if (!content) {
      console.error('Получен пустой ответ от OpenAI API');
      throw new Error('Пустой ответ от API');
    }
    
    console.log('Получен ответ от OpenAI:', content);

    // Улучшенный парсинг ответа
    const suggestions: BrandSuggestion[] = [];
    
    // Разделяем ответ на строки и извлекаем данные
    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
    console.log(`Распознано ${lines.length} строк в ответе:`, lines);
    
    for (const line of lines) {
      try {
        // Более строгий парсинг с проверкой наличия всех полей
        const brandMatch = line.match(/Бренд:\s*([^,]+)/i);
        const productMatch = line.match(/Товар:\s*([^,]+)/i);
        const descriptionMatch = line.match(/Описание:\s*(.+)/i);
        
        if (brandMatch && productMatch && descriptionMatch) {
          const brand = brandMatch[1].trim();
          const product = productMatch[1].trim();
          const description = descriptionMatch[1].trim();
          
          console.log(`Распознаны данные: Бренд="${brand}", Товар="${product}"`);
          
          // Поиск изображения через Google CSE напрямую
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
          
          console.log(`Добавлено предложение для бренда ${brand} с изображением ${imageUrl || "placeholder"}`);
        } else {
          console.warn('Не удалось распознать все необходимые поля в строке:', line);
          console.warn('Результаты регулярных выражений:', {
            brandMatch: brandMatch?.[1] || 'не найдено',
            productMatch: productMatch?.[1] || 'не найдено',
            descriptionMatch: descriptionMatch?.[1] || 'не найдено'
          });
        }
      } catch (error) {
        console.error('Ошибка при парсинге строки:', line, error);
      }
    }

    // Если не удалось получить предложения, создаем демо-данные
    if (suggestions.length === 0) {
      console.warn('Не удалось получить предложения от OpenAI, создаем демо-данные');
      return createMockBrandSuggestions(description);
    }

    // Возвращаем найденные предложения (до 3 результатов)
    console.log(`Возвращаем ${suggestions.length} предложений брендов`);
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
