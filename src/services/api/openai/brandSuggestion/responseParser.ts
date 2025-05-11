
import { BrandSuggestion } from "@/services/types";
import { findProductImage } from "./imageUtils";

// Функция для парсинга ответа от API и создания объектов предложений брендов
export async function parseBrandApiResponse(content: string): Promise<BrandSuggestion[]> {
  try {
    if (!content) {
      console.error("Получен пустой ответ от API");
      return [];
    }
    
    console.log('Ответ от OpenAI для брендов:', content);

    // Попытка найти JSON в ответе
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/\[\s*\{\s*"brand"\s*:/);
    
    let jsonContent = content;
    
    if (jsonMatch && jsonMatch[1]) {
      jsonContent = jsonMatch[1];
    }
    
    // Пробуем извлечь массив объектов из текста
    const suggestions: BrandSuggestion[] = await extractSuggestionsFromText(jsonContent);
    
    // Если удалось получить предложения, возвращаем их
    if (suggestions.length > 0) {
      console.log(`Получено ${suggestions.length} предложений от API:`, suggestions);
      return suggestions;
    }
    
    // Если не удалось получить предложения из JSON
    console.warn('Не удалось разобрать JSON из ответа API');
    return [];
  } catch (error) {
    console.error('Ошибка при парсинге ответа API по брендам:', error);
    return [];
  }
}

// Функция для извлечения предложений из текстового ответа
async function extractSuggestionsFromText(text: string): Promise<BrandSuggestion[]> {
  try {
    // Пытаемся парсить как JSON напрямую
    let data = JSON.parse(text);
    
    // Если это массив, используем его
    if (Array.isArray(data)) {
      // Проверяем, что это массив предложений
      if (isBrandSuggestionArray(data)) {
        return await addImagesIfNeeded(data);
      }
    }
    
    // Если в ответе объект с массивом
    if (data.suggestions && Array.isArray(data.suggestions)) {
      if (isBrandSuggestionArray(data.suggestions)) {
        return await addImagesIfNeeded(data.suggestions);
      }
    }
    
    // Если в ответе объект с продуктами или брендами
    if (data.products && Array.isArray(data.products)) {
      return await addImagesIfNeeded(data.products);
    } else if (data.brands && Array.isArray(data.brands)) {
      return await addImagesIfNeeded(data.brands);
    }
    
    console.warn('Не удалось найти массив предложений в JSON');
    return [];
  } catch (error) {
    console.error('Ошибка при извлечении предложений из текста:', error);
    return [];
  }
}

// Функция для валидации массива предложений
function isBrandSuggestionArray(arr: any[]): arr is Array<{brand: string; product: string; description: string; imageUrl?: string}> {
  return arr.length > 0 && arr.every(item => 
    typeof item === 'object' && 
    typeof item.brand === 'string' && 
    typeof item.product === 'string' && 
    typeof item.description === 'string' && 
    (item.imageUrl === undefined || typeof item.imageUrl === 'string')
  );
}

// Функция для добавления изображений к предложениям
async function addImagesIfNeeded(suggestions: Array<{brand: string; product: string; description: string; imageUrl?: string}>): Promise<BrandSuggestion[]> {
  const results: BrandSuggestion[] = [];
  
  for (let i = 0; i < suggestions.length; i++) {
    const item = suggestions[i];
    
    if (!item.imageUrl) {
      console.log(`Ищем изображение для ${item.brand} ${item.product}`);
      try {
        const imageUrl = await findProductImage(item.brand, item.product, i);
        results.push({
          ...item,
          imageUrl
        });
      } catch (err) {
        console.error(`Ошибка при поиске изображения для ${item.brand}:`, err);
        results.push({
          ...item,
          imageUrl: `https://placehold.co/600x400?text=${encodeURIComponent(item.brand)}`
        });
      }
    } else {
      results.push(item);
    }
  }
  
  return results;
}
