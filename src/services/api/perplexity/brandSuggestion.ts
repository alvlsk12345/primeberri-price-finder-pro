
import { BrandSuggestion } from "@/services/types";
import { callPerplexityAI } from "./apiClient";
import { parseBrandApiResponse } from "../openai/brandSuggestion/responseParser";
import { generateBrandSuggestionPrompt } from "./promptUtils";

/**
 * Получение предложений брендов через Perplexity AI
 * @param description Описание товара
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Используем общую функцию генерации промпта
    const prompt = generateBrandSuggestionPrompt(description);
    
    // Вызываем Perplexity API
    console.log('Запрос к Perplexity API для брендов:', description);
    
    const result = await callPerplexityAI(prompt, {
      model: "sonar",
      temperature: 0.1,
      max_tokens: 600
    });
    
    console.log('Ответ от Perplexity API:', typeof result, result.substring(0, 200) + '...');
    
    // Используем общий парсер для обработки ответа
    const suggestions = await parseBrandApiResponse(result);
    
    return suggestions;
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через Perplexity:', error);
    return [];
  }
};
