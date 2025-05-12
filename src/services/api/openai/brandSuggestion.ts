
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "./apiClient";
import { isUsingSupabaseBackend } from "../supabase/config";
import { fetchBrandSuggestionsViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";
import { generateBrandSuggestionPrompt } from "./brandSuggestion/promptUtils";

// Тип для обработки разных форматов ответа от OpenAI и Supabase
interface ResponseData {
  suggestions?: BrandSuggestion[];
  products?: BrandSuggestion[];
  [key: string]: any; // Для других возможных свойств
}

// Функция для получения предложений брендов через OpenAI
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log('Использование Supabase для получения предложений брендов через OpenAI');
      try {
        const result = await fetchBrandSuggestionsViaOpenAI(description);
        
        // Улучшенная обработка результата от Supabase Edge Function
        console.log('Результат от Supabase Edge Function:', result);
        
        // Если результат - массив, просто возвращаем его
        if (Array.isArray(result)) {
          console.log('Получен массив результатов от Supabase:', result.length);
          return result;
        }
        
        // Если результат - объект с полем suggestions, возвращаем это поле
        if (result && typeof result === 'object') {
          const typedResult = result as ResponseData;
          
          if (typedResult.suggestions && Array.isArray(typedResult.suggestions)) {
            console.log('Получены результаты из поля suggestions:', typedResult.suggestions.length);
            return typedResult.suggestions;
          }
          
          // Также проверяем поле products для обратной совместимости
          if (typedResult.products && Array.isArray(typedResult.products)) {
            console.log('Получены результаты из поля products:', typedResult.products.length);
            return typedResult.products;
          }
          
          // Если есть поля brand/product - это один элемент
          if ('brand' in result || 'product' in result) {
            console.log('Получен один результат как объект');
            return [result as BrandSuggestion];
          }
        }
        
        // Если не удалось обработать результат - возвращаем пустой массив
        console.warn('Неизвестный формат результата от Supabase:', result);
        return [];
      } catch (error) {
        console.error('Ошибка при получении данных от Supabase:', error);
        throw error; // Пробрасываем ошибку дальше для обработки
      }
    }

    // Формируем промпт для получения предложений по брендам
    const prompt = generateBrandSuggestionPrompt(description);

    // Вызываем OpenAI API с обновленными настройками
    const result = await callOpenAI(prompt, {
      model: "gpt-4o", // Используем gpt-4o
      temperature: 0.3,
      max_tokens: 500,
      responseFormat: "json_object",
      n: 1,
      stop: ["\n"]
    });
    
    // Улучшенная обработка ответа от прямого вызова OpenAI API
    console.log('Ответ от OpenAI API:', typeof result, result);
    
    // Если получили строку JSON, пытаемся распарсить
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        
        // Проверяем различные форматы в распарсенном ответе
        if (Array.isArray(parsed)) {
          return parsed;
        }
        
        // Типизируем parsed как ResponseData
        const typedParsed = parsed as ResponseData;
        
        if (typedParsed && typeof typedParsed === 'object') {
          if (typedParsed.suggestions && Array.isArray(typedParsed.suggestions)) {
            return typedParsed.suggestions;
          }
          
          if (typedParsed.products && Array.isArray(typedParsed.products)) {
            return typedParsed.products;
          }
          
          // Если это один объект с полями brand/product
          if ('brand' in parsed || 'product' in parsed) {
            return [parsed as BrandSuggestion];
          }
        }
        
        console.warn('Непонятный формат JSON от OpenAI:', parsed);
        return [];
      } catch (e) {
        console.error('Ошибка при парсинге ответа OpenAI:', e, 'Содержимое:', result);
        return [];
      }
    }
    
    // Если получили уже объект (не строку)
    if (result && typeof result === 'object') {
      // Типизируем result как ResponseData
      const typedResult = result as ResponseData;
      
      // Проверяем наличие поля suggestions или products
      if (typedResult.suggestions && Array.isArray(typedResult.suggestions)) {
        return typedResult.suggestions;
      } else if (typedResult.products && Array.isArray(typedResult.products)) {
        return typedResult.products;
      } else if (Array.isArray(result)) {
        return result;
      } else if ('brand' in result || 'product' in result) {
        // Если получен один объект вместо массива
        return [result as BrandSuggestion];
      }
    }
    
    // Если не удалось получить корректный результат
    console.error('Некорректный формат ответа от OpenAI:', result);
    return [];
    
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через OpenAI:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
};
