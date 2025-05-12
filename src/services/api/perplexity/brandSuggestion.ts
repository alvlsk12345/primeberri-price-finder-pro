
import { BrandSuggestion } from "@/services/types";
import { callPerplexityAI } from "./apiClient";
import { parseBrandApiResponse } from "../openai/brandSuggestion/responseParser";

/**
 * Получение предложений брендов через Perplexity AI
 * @param description Описание товара
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Формируем промпт для получения предложений по брендам
    const prompt = `Ты эксперт по брендам и товарам. Назови 5-6 популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 
    
    Для каждого бренда укажи название товара и краткое описание. 
    
    ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON без дополнительных комментариев. Не возвращай один объект, только массив объектов.
    
    Формат JSON:
    [
      {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
      {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"},
      ... и так далее
    ]`;

    // Вызываем Perplexity API
    console.log('Запрос к Perplexity API для брендов:', description);
    
    const result = await callPerplexityAI(prompt, {
      model: "llama-3.1-sonar-small-128k-online",
      temperature: 0.1,
      max_tokens: 600
    });
    
    console.log('Ответ от Perplexity API:', typeof result, result.substring(0, 200) + '...');
    
    // Используем существующий парсер для обработки ответа
    const suggestions = await parseBrandApiResponse(result);
    
    return suggestions;
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через Perplexity:', error);
    return [];
  }
};
