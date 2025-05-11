
import { BrandSuggestion } from "@/services/types";
import { findProductImage } from "./imageUtils";

// Парсинг ответа API и создание объектов BrandSuggestion
export async function parseBrandApiResponse(content: string): Promise<BrandSuggestion[]> {
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
  
  const processingPromises = lines.map(async (line: string, index: number) => {
    try {
      // Улучшенное регулярное выражение для более надежного извлечения данных
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
          const imageUrl = await findProductImage(brand, product, index);
          return { brand, product, description, imageUrl };
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
    return null;
  });
  
  // Ожидаем завершения всех асинхронных операций
  const results = await Promise.all(processingPromises);
  
  // Фильтруем null значения
  return results.filter((item): item is BrandSuggestion => item !== null);
}
