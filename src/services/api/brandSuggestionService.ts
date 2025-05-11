
import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromAbacus } from "./abacus";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "sonner";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidAbacusApiKey } from "./abacus/config";

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    console.log(`Используем ${provider} для получения предложений брендов`);
    
    // Проверяем наличие валидного API ключа для выбранного провайдера
    if (provider === 'openai' && !hasValidOpenAIApiKey()) {
      toast.error("API ключ OpenAI не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ OpenAI не установлен");
    } else if (provider === 'abacus' && !hasValidAbacusApiKey()) {
      toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ в настройках");
      throw new Error("API ключ Abacus.ai не установлен");
    }
    
    // Выбираем функцию в зависимости от провайдера
    if (provider === 'abacus') {
      return await fetchBrandSuggestionsFromAbacus(description);
    } else {
      // По умолчанию используем OpenAI
      return await fetchBrandSuggestionsFromOpenAI(description);
    }
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    
    // Пытаемся использовать альтернативного провайдера при ошибке
    try {
      const alternativeProvider: AIProvider = provider === 'openai' ? 'abacus' : 'openai';
      
      // Проверяем наличие ключа для альтернативного провайдера
      const hasAlternativeKey = alternativeProvider === 'openai' 
        ? hasValidOpenAIApiKey() 
        : hasValidAbacusApiKey();
      
      if (hasAlternativeKey) {
        console.log(`Пробуем альтернативного провайдера: ${alternativeProvider}`);
        toast.info(`Проблема с ${provider}, пробуем использовать ${alternativeProvider}...`, { duration: 3000 });
        
        // Выбираем функцию для альтернативного провайдера
        if (alternativeProvider === 'abacus') {
          return await fetchBrandSuggestionsFromAbacus(description);
        } else {
          return await fetchBrandSuggestionsFromOpenAI(description);
        }
      }
    } catch (alternativeError) {
      console.error('Ошибка и с альтернативным провайдером:', alternativeError);
    }
    
    // Если обе попытки не удались, пробрасываем оригинальную ошибку
    throw error;
  }
};
