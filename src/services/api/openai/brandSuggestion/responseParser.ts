import { BrandSuggestion } from "@/services/types";
import { findProductImage } from "./imageUtils";

// Функция для парсинга ответа от API и создания объектов предложений брендов
export async function parseBrandApiResponse(content: string | any): Promise<BrandSuggestion[]> {
  try {
    if (!content) {
      console.error("Получен пустой ответ от API");
      return [];
    }
    
    console.log('Ответ от OpenAI для брендов (тип):', typeof content);
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
      
      // Проверяем, является ли строка обернутой в объект с полем result
      // (устаревший формат для совместимости)
      if (cleanContent.startsWith('{"result":')) {
        try {
          const resultObj = JSON.parse(cleanContent);
          if (resultObj.result) {
            // Если есть поле result, используем его содержимое
            cleanContent = typeof resultObj.result === 'string' ? 
              resultObj.result : 
              JSON.stringify(resultObj.result);
          }
        } catch (e) {
          console.warn('Не удалось обработать объект с полем result:', e);
        }
      }
      
      // Удаляем возможные объекты-обертки JSON
      if (cleanContent.startsWith('{"suggestions":') || 
          cleanContent.startsWith('{"brands":') || 
          cleanContent.startsWith('{"items":') || 
          cleanContent.startsWith('{"products":')) {
        try {
          // Пытаемся распарсить как объект с массивом
          const tempObj = JSON.parse(cleanContent);
          // Извлекаем массив из объекта-обертки
          if (tempObj.suggestions) cleanContent = JSON.stringify(tempObj.suggestions);
          else if (tempObj.brands) cleanContent = JSON.stringify(tempObj.brands);
          else if (tempObj.items) cleanContent = JSON.stringify(tempObj.items);
          else if (tempObj.products) cleanContent = JSON.stringify(tempObj.products);
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
      const arrayField = Object.keys(jsonData).find(
        key => Array.isArray(jsonData[key])
      );
      
      if (arrayField) {
        console.log(`Обнаружен массив в поле ${arrayField}`);
        items = jsonData[arrayField];
      }
      // Если это один объект с полями brand и products
      else if (jsonData.brand && jsonData.product) {
        console.log('Обнаружен формат с одним объектом бренда и товаром');
        items = [jsonData];
      }
      else {
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
