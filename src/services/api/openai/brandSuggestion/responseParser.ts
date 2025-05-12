
import { BrandSuggestion } from "@/services/types";
import { findProductImage } from "./imageUtils";

// Функция для парсинга ответа от API и создания объектов предложений брендов
export async function parseBrandApiResponse(content: string | any): Promise<BrandSuggestion[]> {
  try {
    if (!content) {
      console.error("Получен пустой ответ от API");
      return [];
    }
    
    console.log('Ответ от AI для брендов (тип):', typeof content);
    if (typeof content === 'string') {
      console.log('Ответ как строка (первые 200 символов):', content.substring(0, 200) + '...');
    } else {
      console.log('Ответ как объект:', content);
    }

    let jsonData: any;
    
    // Проверяем, является ли content уже объектом (может быть после парсинга в edge функции)
    if (typeof content !== 'string') {
      jsonData = content;
    }
    // Если content - строка, пытаемся распарсить
    else {
      // Удаляем все ведущие и завершающие нестандартные символы
      let cleanContent = content.trim();
      
      // Удаляем маркеры кода markdown если они есть
      cleanContent = cleanContent.replace(/^```json\s*/g, '').replace(/\s*```$/g, '');
      cleanContent = cleanContent.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      
      // Проверяем наличие дополнительного текста до или после JSON
      const jsonStart = cleanContent.indexOf('[');
      const jsonEnd = cleanContent.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      // Проверяем, является ли строка обернутой в объект с полем result/suggestions/etc.
      if (cleanContent.startsWith('{') && !cleanContent.startsWith('[')) {
        try {
          const wrapper = JSON.parse(cleanContent);
          // Проверяем различные возможные поля с массивом данных
          const possibleArrayFields = ['result', 'results', 'suggestions', 'brands', 'items', 'products', 'data'];
          
          for (const field of possibleArrayFields) {
            if (wrapper[field] && (Array.isArray(wrapper[field]) || typeof wrapper[field] === 'string')) {
              // Если нашли поле с массивом, используем его содержимое
              if (Array.isArray(wrapper[field])) {
                cleanContent = JSON.stringify(wrapper[field]);
                break;
              } else if (typeof wrapper[field] === 'string') {
                cleanContent = wrapper[field];
                break;
              }
            }
          }
        } catch (e) {
          console.warn('Не удалось обработать объект-обертку:', e);
        }
      }
      
      try {
        jsonData = JSON.parse(cleanContent);
        console.log('JSON успешно распарсен:', jsonData);
      } catch (parseError) {
        console.error('Ошибка при парсинге JSON:', parseError);
        
        // Если не получилось распарсить, пробуем найти JSON в тексте
        const jsonMatch = cleanContent.match(/\[\s*\{.+?\}\s*\]/s);
        if (jsonMatch) {
          try {
            console.log('Найден JSON массив в тексте, пытаемся распарсить');
            jsonData = JSON.parse(jsonMatch[0]);
          } catch (nestedParseError) {
            console.error('Ошибка при парсинге найденного JSON:', nestedParseError);
            return [];
          }
        } else {
          console.error('Не удалось найти JSON массив в ответе');
          return [];
        }
      }
    }
    
    // Проверяем различные форматы ответа
    let items: any[] = [];
    
    // Если данные уже являются массивом
    if (Array.isArray(jsonData)) {
      console.log('Обнаружен прямой массив объектов');
      items = jsonData;
    } 
    // Если данные - объект с массивом
    else if (jsonData && typeof jsonData === 'object') {
      // Пробуем извлечь массив из любого поля, которое его содержит
      const possibleArrayFields = ['suggestions', 'brands', 'items', 'products', 'data', 'result', 'results'];
      
      for (const field of possibleArrayFields) {
        if (jsonData[field] && Array.isArray(jsonData[field])) {
          console.log(`Обнаружен массив в поле ${field}`);
          items = jsonData[field];
          break;
        }
      }
      
      // Если это один объект с полями brand и products
      if (items.length === 0 && jsonData.brand && jsonData.product) {
        console.log('Обнаружен формат с одним объектом бренда и товаром');
        items = [jsonData];
      }
      
      if (items.length === 0) {
        console.error('Не удалось найти массив данных в ответе:', jsonData);
        return [];
      }
    }
    else {
      console.error('Неподдерживаемый формат данных:', jsonData);
      return [];
    }
    
    if (!items || items.length === 0) {
      console.error('Массив предложений пуст');
      return [];
    }
    
    console.log(`Найдено ${items.length} предложений:`, items);
    
    // Преобразуем в формат BrandSuggestion
    const results: BrandSuggestion[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Обрабатываем поля согласно формату
      const brandName = item.brand || "";
      const productName = item.product || "";
      const description = item.description || "";
      
      console.log(`Обрабатываем предложение ${i+1}: ${brandName} - ${productName}`);
      
      // Поиск изображения для товара если оно не указано
      let imageUrl = '';
      if (brandName) {
        try {
          imageUrl = await findProductImage(brandName, productName, i);
          console.log(`Найдено изображение: ${imageUrl}`);
        } catch (err) {
          console.error(`Ошибка при поиске изображения:`, err);
        }
      }
      
      // Добавляем в результаты в требуемом формате
      results.push({
        brand: brandName,
        product: productName,
        description: description,
        imageUrl: imageUrl,
      });
    }
    
    console.log(`Финальный результат: ${results.length} предложений`, results);
    return results;
  } catch (error) {
    console.error('Критическая ошибка при парсинге ответа API по брендам:', error);
    return [];
  }
}
