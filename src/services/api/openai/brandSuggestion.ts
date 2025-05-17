
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
      const result = await fetchBrandSuggestionsViaOpenAI(description);
      
      // Убедимся, что результат всегда возвращается как массив BrandSuggestion[]
      if (Array.isArray(result)) {
        return result.map(item => adaptToBrandSuggestion(item));
      }
      
      // Если результат не массив, но имеет поле products, возвращаем его
      if (result && typeof result === 'object' && 'products' in result) {
        const products = (result as any).products;
        if (Array.isArray(products)) {
          return products.map(item => adaptToBrandSuggestion(item));
        }
      }
      
      // В случае непредвиденного формата возвращаем пустой массив
      console.warn('Неожиданный формат результата от Supabase:', result);
      return [];
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
    
    // Обрабатываем ответ
    if (Array.isArray(result)) {
      // Приведение возвращаемых данных к типу BrandSuggestion
      return result.map(item => adaptToBrandSuggestion(item));
    } else if (result && typeof result === 'object') {
      // Проверяем наличие поля products
      if ('products' in result && Array.isArray((result as any).products)) {
        return (result as any).products.map((item: any) => adaptToBrandSuggestion(item));
      } else if (result.brand || result.name || result.product) {
        // Если получен один объект вместо массива
        console.log('Получен один объект вместо массива, преобразуем его');
        return [adaptToBrandSuggestion(result)];
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

// Функция адаптер для приведения ответа от API к типу BrandSuggestion
function adaptToBrandSuggestion(item: any): BrandSuggestion {
  return {
    id: item.id || crypto.randomUUID().slice(0, 8),
    name: item.name || item.brand || "Неизвестный бренд",
    brand: item.brand || item.name || "Неизвестный бренд",
    product: item.product || "",
    description: item.description || "Описание недоступно",
    logoUrl: item.logoUrl || item.imageUrl || undefined,
    category: item.category || undefined,
    confidence: item.confidence || undefined,
    price: item.price || undefined
  };
}
