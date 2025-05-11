
import { BrandSuggestion } from "@/services/types";
import { callOpenAI } from "./apiClient";
import { isUsingSupabaseBackend } from "../supabase/config";
import { fetchBrandSuggestionsViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";

// Функция для получения предложений брендов через OpenAI
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && isSupabaseConnected()) {
      console.log('Использование Supabase для получения предложений брендов через OpenAI');
      return await fetchBrandSuggestionsViaOpenAI(description);
    }

    // Формируем промпт для получения предложений по брендам
    const prompt = `Ты — эксперт по брендам и товарам. Пользователь описал тип товара, который они хотят найти. 
Предложи 5 брендов, которые соответствуют этому описанию. Верни только JSON массив объектов с полями:
- name: название бренда (только название, без "бренд" или других пояснений)
- logo: URL логотипа бренда (должен быть прямой ссылкой на изображение в формате PNG, JPG или WebP)
- description: краткое описание бренда в контексте запрашиваемого товара (1-2 предложения на русском языке)
- products: массив из 3-5 конкретных товаров этого бренда, соответствующих запросу (только названия товаров)

Обязательно нужны русские бренды или популярные международные. Не выдумывай бренды и товары.
Запрашиваемый тип товара: ${description}`;

    // Вызываем OpenAI API
    const result = await callOpenAI(prompt, {
      model: "gpt-4o-search-preview-2025-03-11",
      temperature: 0.2,
      max_tokens: 1500,
      responseFormat: "json_object"
    });
    
    // Обрабатываем ответ
    if (Array.isArray(result)) {
      return result.map((brand: any) => ({
        name: brand.name || "Неизвестный бренд",
        logo: brand.logo || "https://via.placeholder.com/100",
        description: brand.description || "Описание недоступно",
        products: Array.isArray(brand.products) ? brand.products : ["Товар 1", "Товар 2"]
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
