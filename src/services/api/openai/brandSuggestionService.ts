
import { toast } from "sonner";
import { BrandSuggestion } from "@/services/types";
import { getPlaceholderImageUrl } from "@/services/imageService";
import { searchProductImageGoogle } from "@/services/api/googleSearchService";
import { callOpenAI } from "./apiClient";
import { getApiKey } from "./config";

// Улучшенная функция для получения предложений брендов
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверка наличия API ключа
    const apiKey = getApiKey();
    
    if (!apiKey) {
      toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ не установлен");
    }

    console.log('Отправляем запрос к OpenAI для получения брендов...');
    
    // Улучшенный промпт с более строгими требованиями к формату ответа и примерами
    const brandPrompt = `Предложи 3 популярных бренда товаров, соответствующих запросу пользователя "${description}".

ОЧЕНЬ ВАЖНО: Ты должен точно следовать этому формату в своём ответе. Ответ должен содержать ровно 3 строки, каждая в следующем формате:
Бренд: [название бренда], Товар: [название товара], Описание: [краткое описание]

Правила:
1. Название бренда должно быть реальным, существующим брендом
2. Название товара должно быть конкретным и соответствовать запросу
3. Описание должно быть в одно предложение
4. НЕ нумеруй строки
5. НЕ добавляй никаких пояснений, вступлений или заключений
6. Строго следуй указанному формату!

Примеры правильных ответов для запроса "кроссовки для бега":
Бренд: Nike, Товар: Air Zoom Pegasus 38, Описание: Легкие беговые кроссовки с амортизацией и поддержкой стопы.
Бренд: Adidas, Товар: Ultraboost 22, Описание: Комфортные кроссовки с технологией Boost для длительных пробежек.
Бренд: ASICS, Товар: Gel-Kayano 29, Описание: Стабилизирующие кроссовки с гелевой амортизацией для защиты суставов.

Ответь ТОЛЬКО строками в указанном формате для запроса: "${description}"`;

    // Получаем ответ от API с оптимизированными параметрами для лучшего качества
    console.log('Отправляем промпт к OpenAI:', brandPrompt);
    
    // Используем температуру ближе к 0 для более точных ответов
    const content = await callOpenAI(brandPrompt, {
      temperature: 0.3,
      max_tokens: 350,
      model: "gpt-4o-search-preview-2025-03-11" // Изменено с gpt-4o на модель, оптимизированную для поисковых запросов
    });

    if (!content) {
      console.error('Получен пустой ответ от OpenAI API');
      throw new Error('Пустой ответ от API');
    }
    
    console.log('Получен ответ от OpenAI:', content);

    // Улучшенный парсинг ответа с дополнительными проверками
    const suggestions: BrandSuggestion[] = [];
    
    // Разделяем ответ на строки и фильтруем пустые строки
    const lines = content.split('\n')
      .filter((line: string) => line.trim() !== '')
      .filter((line: string) => line.includes('Бренд:') && line.includes('Товар:'));
    
    console.log(`Распознано ${lines.length} строк в ответе:`, lines);
    
    // Если ответ не содержит строк в ожидаемом формате, логируем это
    if (lines.length === 0) {
      console.error('Ответ не содержит строк в требуемом формате');
      console.error('Исходный ответ:', content);
      throw new Error('Неверный формат ответа от API');
    }
    
    for (const line of lines) {
      try {
        // Улучшенное регулярное выражение для более надежного извлечения данных
        // Используем регулярные выражения с группами захвата для более точного извлечения
        const brandMatch = line.match(/Бренд:\s*([^,]+)/i);
        const productMatch = line.match(/Товар:\s*([^,]+)/i);
        const descriptionMatch = line.match(/Описание:\s*(.+)/i);
        
        if (brandMatch && productMatch && descriptionMatch) {
          const brand = brandMatch[1].trim();
          const product = productMatch[1].trim();
          const description = descriptionMatch[1].trim();
          
          console.log(`Успешно распознаны данные: Бренд="${brand}", Товар="${product}", Описание="${description}"`);
          
          // Ищем изображение только если у нас есть корректный бренд и название продукта
          if (brand && product) {
            console.log(`Поиск изображения для ${brand} ${product} через Google CSE`);
            
            try {
              // Поиск изображения с ограничением времени
              const imagePromise = searchProductImageGoogle(brand, product, suggestions.length);
              
              // Устанавливаем таймаут для поиска изображения
              const timeoutPromise = new Promise<string | null>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 8000)
              );
              
              // Используем Race для ограничения времени выполнения
              const imageUrl = await Promise.race([imagePromise, timeoutPromise]);
              
              if (imageUrl) {
                console.log(`Найдено изображение: ${imageUrl}`);
                suggestions.push({ brand, product, description, imageUrl });
              } else {
                console.warn(`Изображение не найдено для ${brand} ${product}, используем плейсхолдер`);
                suggestions.push({ brand, product, description, imageUrl: getPlaceholderImageUrl(brand) });
              }
            } catch (imageError) {
              console.error("Ошибка при поиске изображения:", imageError);
              // В случае ошибки поиска изображения используем заполнитель
              suggestions.push({ brand, product, description, imageUrl: getPlaceholderImageUrl(brand) });
            }
          }
        } else {
          console.warn('Не удалось распознать все необходимые поля в строке:', line);
          console.warn('Результаты регулярных выражений:', {
            brandMatch: brandMatch ? brandMatch[1] : 'не найдено',
            productMatch: productMatch ? productMatch[1] : 'не найдено',
            descriptionMatch: descriptionMatch ? descriptionMatch[1] : 'не найдено'
          });
        }
      } catch (error) {
        console.error('Ошибка при парсинге строки:', line, error);
      }
    }

    // Если не удалось получить хотя бы одно предложение, создаем демо-данные
    if (suggestions.length === 0) {
      console.warn('Не удалось получить корректные предложения от OpenAI, создаем демо-данные');
      toast.warning("Не удалось получить реальные данные о брендах. Показываем примеры.", { duration: 4000 });
      return createMockBrandSuggestions(description);
    }

    // Если получили меньше 3 предложений, дополняем их моками чтобы сохранить консистентность UI
    if (suggestions.length < 3) {
      console.warn(`Получено только ${suggestions.length} предложений. Дополняем моками до 3`);
      const mocks = createMockBrandSuggestions(description);
      for (let i = suggestions.length; i < 3; i++) {
        suggestions.push(mocks[i % mocks.length]);
      }
    }

    console.log(`Возвращаем ${suggestions.length} предложений брендов:`, suggestions);
    return suggestions.slice(0, 3); // Ограничиваем 3 результатами

  } catch (error) {
    console.error('Ошибка при запросе к OpenAI для брендов:', error);
    
    // Показываем пользователю информацию о проблеме и что используем демо-данные
    toast.error(`Ошибка при получении брендов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { 
      duration: 4000,
      description: "Используем демонстрационные данные"
    });
    
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
