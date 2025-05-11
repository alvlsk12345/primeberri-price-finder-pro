
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
      return await fetchBrandSuggestionsViaOpenAI(description);
    }

    // Формируем промпт для получения предложений по брендам
    const prompt = generateBrandSuggestionPrompt(description);

    // Вызываем OpenAI API с обновленными настройками
    const result = await callOpenAI(prompt, {
      model: "gpt-4o", // Обновляем на gpt-4o, который поддерживает responseFormat: "json_object"
      temperature: 0.3,
      max_tokens: 500,
      responseFormat: "json_object",
      n: 1,
      stop: ["\n"]
    });
    
    // Обрабатываем ответ
    if (Array.isArray(result)) {
      // Приведение возвращаемых данных к типу BrandSuggestion
      return result.map((brand: any) => ({
        brand: brand.brand || brand.name || "Неизвестный бренд",
        product: brand.product || "",
        description: brand.description || "Описание недоступно",
      }));
    }
    
    // Если не удалось получить корректный массив
    console.error('Некорректный формат ответа от OpenAI:', result);
    return [];
    
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через OpenAI:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
};
