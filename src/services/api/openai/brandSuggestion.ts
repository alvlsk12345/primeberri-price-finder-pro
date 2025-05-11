
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "./apiClient";
import { isUsingSupabaseBackend } from "../supabase/config";
import { fetchBrandSuggestionsViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";

// Функция для получения предложений брендов через OpenAI
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log('Использование Supabase для получения предложений брендов через OpenAI');
      return await fetchBrandSuggestionsViaOpenAI(description);
    }

    // Формируем промпт для получения предложений по брендам
    const prompt = `Ты эксперт по брендам и товарам. Назови 5 популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. \n\nОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON.\n\nФормат ответа должен быть таким:\n[\n  {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},\n  {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"},\n  {"brand": "Название бренда 3", "product": "Название товара 3", "description": "Описание товара 3"},\n  {"brand": "Название бренда 4", "product": "Название товара 4", "description": "Описание товара 4"},\n  {"brand": "Название бренда 5", "product": "Название товара 5", "description": "Описание товара 5"}\n]`;

    // Вызываем OpenAI API с обновленными настройками
    const result = await callOpenAI(prompt, {
      model: "gpt-4",
      temperature: 0.3,
      max_tokens: 500,
      n: 1,
      stop: ["\n"],
      responseFormat: "json_object"
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
