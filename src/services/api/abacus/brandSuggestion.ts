
import { BrandSuggestion } from "@/services/types";
import { callAbacusAI } from "./apiClient";
import { toast } from "sonner";

/**
 * Функция для получения предложений по брендам через Abacus API
 * @param description Описание запроса
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Формируем запрос к Abacus API для получения брендов
    const searchData = {
      prompt: `Предложи 5 брендов, которые соответствуют следующему описанию и верни их в формате JSON: ${description}`,
      options: {
        temperature: 0.7,
        maxTokens: 500,
        format: 'json'
      }
    };
    
    console.log('Отправляем запрос к Abacus AI для получения предложений брендов');

    // В реальном проекте этот эндпоинт нужно заменить на актуальный эндпоинт Abacus API
    const result = await callAbacusAI('textGeneration', 'POST', searchData);
    
    if (!result || !result.text) {
      console.warn('Пустой ответ от Abacus API');
      return [];
    }
    
    // Пытаемся распарсить ответ как JSON
    try {
      let parsedResults;
      
      // Если результат уже является объектом
      if (typeof result.text === 'object') {
        parsedResults = result.text;
      } else {
        // Иначе пытаемся распарсить как JSON строку
        parsedResults = JSON.parse(result.text);
      }
      
      // Нормализуем результаты в формат BrandSuggestion[]
      const suggestions: BrandSuggestion[] = [];
      
      if (Array.isArray(parsedResults)) {
        // Если результат - массив объектов
        for (const item of parsedResults) {
          if (item && (item.brand || item.name)) {
            suggestions.push({
              brand: item.brand || item.name,
              product: item.product || '',
              description: item.description || 'Описание недоступно',
              ...item
            });
          }
        }
      } else if (parsedResults.products && Array.isArray(parsedResults.products)) {
        // Если результат имеет поле products с массивом объектов
        for (const item of parsedResults.products) {
          if (item && (item.brand || item.name)) {
            suggestions.push({
              brand: item.brand || item.name,
              product: item.product || '',
              description: item.description || 'Описание недоступно',
              ...item
            });
          }
        }
      }
      
      return suggestions;
    } catch (parseError) {
      console.error('Ошибка при парсинге ответа от Abacus API:', parseError);
      console.log('Сырой ответ от API:', result.text);
      return [];
    }
  } catch (error) {
    console.error('Ошибка при запросе к Abacus API для получения брендов:', error);
    toast.error('Ошибка при получении предложений брендов через Abacus API', { duration: 3000 });
    return [];
  }
};
