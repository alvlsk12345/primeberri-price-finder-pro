
import { SearchParams, SearchResult, BrandSuggestion } from "@/services/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Выполняет запрос к OpenAI через Supabase Edge Function
 */
export const searchViaOpenAI = async (params: SearchParams, options: any = {}): Promise<any> => {
  try {
    console.log("Вызов OpenAI через Supabase Edge Function:", { params, options });
    
    // Вызываем Edge Function для запроса к OpenAI
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'openai',
        prompt: params.query,
        options: options
      }
    });

    if (error) {
      console.error("Ошибка при вызове OpenAI через Supabase Edge Function:", error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }

    console.log("Ответ от OpenAI через Supabase Edge Function:", data);
    return data;
    
  } catch (error) {
    console.error("Ошибка при вызове OpenAI через Supabase:", error);
    throw error;
  }
};

/**
 * Выполняет запрос к Perplexity через Supabase Edge Function
 */
export const searchViaPerplexity = async (params: SearchParams, method: 'GET' | 'POST' = 'POST', requestData: Record<string, any> = {}): Promise<any> => {
  try {
    console.log("Вызов Perplexity через Supabase Edge Function:", { params, method, requestData });
    
    // Вызываем Edge Function для запроса к Perplexity
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'abacus', // или 'perplexity', в зависимости от настроек Edge Function
        prompt: params.query,
        method: method,
        requestData: requestData
      }
    });

    if (error) {
      console.error("Ошибка при вызове Perplexity через Supabase Edge Function:", error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }

    console.log("Ответ от Perplexity через Supabase Edge Function:", data);
    return data;
    
  } catch (error) {
    console.error("Ошибка при вызове Perplexity через Supabase:", error);
    throw error;
  }
};

/**
 * Получает предложения брендов через OpenAI с использованием Supabase Edge Function
 */
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    console.log("Получение предложений брендов через OpenAI (Supabase):", description);
    
    // Вызываем Edge Function для получения предложений брендов
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'openai',
        action: 'getBrandSuggestions',
        description: description,
        count: 6
      }
    });

    if (error) {
      console.error("Ошибка при получении предложений брендов через OpenAI (Supabase):", error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }

    console.log("Предложения брендов от OpenAI через Supabase Edge Function:", data);
    
    // Проверяем формат ответа и возвращаем массив предложений
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && 'products' in data) {
      return data.products;
    }
    
    // Если пришел некорректный формат, возвращаем пустой массив
    return [];
    
  } catch (error) {
    console.error("Ошибка при получении предложений брендов через OpenAI (Supabase):", error);
    return [];
  }
};
