
import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromAbacus } from "./abacus";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "sonner";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidAbacusApiKey } from "./abacus/config";
import { isUsingSupabaseBackend } from "./supabase/config";
import { isSupabaseConnected } from "./supabase/client";
import { fetchBrandSuggestionsViaOpenAI } from "./supabase/aiService";

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    console.log(`Используем ${provider} для получения предложений брендов`);
    
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log('Использование Supabase бэкенда для получения предложений брендов');
      try {
        return await fetchBrandSuggestionsViaOpenAI(description);
      } catch (error) {
        console.error('Ошибка при использовании Supabase для предложений брендов:', error);
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                   { duration: 3000 });
        toast.info('Используем прямой вызов API как запасной вариант', { duration: 2000 });
        // Продолжаем с обычным процессом, если Supabase не сработал
      }
    }
    
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
      console.log("Вызываем OpenAI для получения предложений брендов");
      const suggestions = await fetchBrandSuggestionsFromOpenAI(description);
      console.log("Получены предложения от OpenAI:", suggestions);
      return suggestions;
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
    
    // Если обе попытки не удались, возвращаем пустой массив
    return [];
  }
};
