
import { BrandSuggestion } from "@/services/types";
import { findProductImage } from "./imageUtils";

// Функция для парсинга ответа от API и создания объектов предложений брендов
export async function parseBrandApiResponse(content: string): Promise<BrandSuggestion[]> {
  try {
    if (!content) {
      console.error("Получен пустой ответ от API");
      return [];
    }
    
    console.log('Ответ от OpenAI для брендов (первые 200 символов):', 
                typeof content === 'string' ? content.substring(0, 200) + '...' : 'Не строка');

    let jsonData: any;
    try {
      // Пытаемся распарсить JSON напрямую
      jsonData = typeof content === 'string' ? JSON.parse(content) : content;
      console.log('JSON успешно распарсен:', jsonData);
    } catch (parseError) {
      console.error('Ошибка при парсинге JSON:', parseError);
      
      // Пытаемся найти JSON в ответе, если он обернут в какой-то текст
      if (typeof content === 'string') {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/\{\s*"suggestions"\s*:\s*\[/) ||
                         content.match(/\[\s*\{\s*"brand"\s*:/);
        
        if (jsonMatch && jsonMatch[1]) {
          try {
            console.log('Найден JSON в тексте, пытаемся распарсить');
            jsonData = JSON.parse(jsonMatch[1]);
          } catch (nestedParseError) {
            console.error('Ошибка при парсинге найденного JSON:', nestedParseError);
            return [];
          }
        } else {
          console.error('Не удалось найти JSON в ответе');
          return [];
        }
      } else {
        console.error('Ответ от API не является строкой:', content);
        return [];
      }
    }
    
    // Проверяем различные форматы ответа
    let suggestions: any[] = [];
    
    // Формат 1: { "suggestions": [ {...}, {...} ] }
    if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
      console.log('Обнаружен формат с массивом suggestions');
      suggestions = jsonData.suggestions;
    } 
    // Формат 2: [ {...}, {...} ]
    else if (Array.isArray(jsonData)) {
      console.log('Обнаружен формат с массивом объектов');
      suggestions = jsonData;
    }
    // Формат 3: { "items": [ {...}, {...} ] } или другие варианты
    else if (jsonData && jsonData.items && Array.isArray(jsonData.items)) {
      console.log('Обнаружен формат с массивом items');
      suggestions = jsonData.items;
    }
    // Формат 4: { "brands": [ {...}, {...} ] }
    else if (jsonData && jsonData.brands && Array.isArray(jsonData.brands)) {
      console.log('Обнаружен формат с массивом brands');
      suggestions = jsonData.brands;
    }
    // Формат 5: { "products": [ {...}, {...} ] }
    else if (jsonData && jsonData.products && Array.isArray(jsonData.products)) {
      console.log('Обнаружен формат с массивом products');
      suggestions = jsonData.products;
    } 
    // Формат 6: Один объект с массивом продуктов
    else if (jsonData && jsonData.brand && jsonData.products && Array.isArray(jsonData.products)) {
      console.log('Обнаружен формат с одним объектом бренда и массивом products');
      // Превращаем один объект бренда с массивом продуктов в массив объектов
      suggestions = jsonData.products.map((product: string | any) => ({
        brand: jsonData.brand,
        product: typeof product === 'string' ? product : (product.name || product.product || ''),
        description: product.description || jsonData.description || ''
      }));
    }
    else {
      console.error('Не удалось найти массив предложений в ответе:', jsonData);
      return [];
    }
    
    if (!suggestions || suggestions.length === 0) {
      console.error('Массив предложений пуст');
      return [];
    }
    
    console.log(`Найдено ${suggestions.length} предложений:`, suggestions);
    
    // Преобразуем в формат BrandSuggestion и добавляем изображения
    const results: BrandSuggestion[] = [];
    
    for (let i = 0; i < suggestions.length; i++) {
      const item = suggestions[i];
      const brand = item.brand || item.name || '';
      const product = item.product || item.name || '';
      const description = item.description || '';
      
      console.log(`Обрабатываем предложение ${i+1}: ${brand} - ${product}`);
      
      // Поиск изображения для товара
      let imageUrl = item.imageUrl || item.logo || '';
      if (!imageUrl && brand) {
        console.log(`Ищем изображение для ${brand} ${product}`);
        try {
          imageUrl = await findProductImage(brand, product, i);
          console.log(`Найдено изображение: ${imageUrl}`);
        } catch (err) {
          console.error(`Ошибка при поиске изображения:`, err);
        }
      }
      
      // Добавляем в результаты, поддерживая оба формата
      results.push({
        brand: brand,
        product: product,
        description: description,
        imageUrl: imageUrl,
        
        // Поддержка старого формата для совместимости
        name: brand,
        logo: imageUrl,
        products: product ? [product] : []
      });
    }
    
    console.log(`Финальный результат: ${results.length} предложений`, results);
    return results;
  } catch (error) {
    console.error('Критическая ошибка при парсинге ответа API по брендам:', error);
    return [];
  }
}
