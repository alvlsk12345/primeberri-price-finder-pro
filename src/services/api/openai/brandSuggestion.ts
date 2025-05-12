
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "./apiClient";
import { isUsingSupabaseBackend } from "../supabase/config";
import { fetchBrandSuggestionsViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";
import { generateBrandSuggestionPrompt } from "./brandSuggestion/promptUtils";

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
          if ('suggestions' in result && Array.isArray(result.suggestions)) {
            console.log('Получены результаты из поля suggestions:', result.suggestions.length);
            return result.suggestions;
          }
          
          // Также проверяем поле products для обратной совместимости
          if ('products' in result && Array.isArray(result.products)) {
            console.log('Получены результаты из поля products:', result.products.length);
            return result.products;
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
        
        if (parsed && typeof parsed === 'object') {
          if ('suggestions' in parsed && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
          }
          
          if ('products' in parsed && Array.isArray(parsed.products)) {
            return parsed.products;
          }
          
          // Если это один объект с полями brand/product
          if ('brand' in parsed || 'product' in parsed) {
            return [parsed];
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
      // Проверяем наличие поля suggestions или products
      if ('suggestions' in result && Array.isArray((result as any).suggestions)) {
        return (result as any).suggestions;
      } else if ('products' in result && Array.isArray((result as any).products)) {
        return (result as any).products;
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
