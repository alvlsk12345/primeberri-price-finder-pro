import { SearchResult, BrandSuggestion } from "@/services/types";
import { supabase } from "@/integrations/supabase/client";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { toast } from "sonner";

/**
 * Получает предложения брендов через OpenAI используя Supabase Edge Function
 * @param description Описание запроса
 */
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Отправляем запрос к Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'openai',
        endpoint: 'completions',
        body: {
          prompt: `Provide 6 brand suggestions for: ${description}`,
          options: {
            responseFormat: 'json',
            model: 'gpt-4o',
            temperature: 0.7
          }
        }
      }
    });

    if (error) {
      console.error('Ошибка при вызове AI Proxy функции OpenAI:', error);
      toast.error(`Ошибка Edge Function: ${error.message}`, { duration: 3000 });
      return [];
    }

    // Проверка на валидность данных
    if (!data) {
      console.warn('Пустой ответ от Edge Function OpenAI');
      return [];
    }

    console.log('Получен ответ от OpenAI через Supabase:', data);
    
    // Парсинг результатов
    try {
      // Если результат уже является объектом с массивом предложений
      if (data.products && Array.isArray(data.products)) {
        return data.products;
      } 
      
      // Если результат - строка JSON
      if (typeof data === 'string' || data.text) {
        const jsonText = typeof data === 'string' ? data : (data.text || '');
        const parsed = JSON.parse(jsonText);
        if (parsed.products && Array.isArray(parsed.products)) {
          return parsed.products;
        }
      }
      
      // Если нет нужной структуры, возвращаем пустой массив
      console.warn('Непонятный формат ответа от OpenAI:', data);
      return [];
      
    } catch (parseError) {
      console.error('Ошибка при парсинге ответа от OpenAI:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Ошибка при запросе к OpenAI через Supabase:', error);
    toast.error(`Ошибка запроса OpenAI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
    return [];
  }
};

/**
 * Получает предложения брендов через Perplexity API, используя Supabase Edge Function
 * @param description Описание запроса
 */
export const searchViaPerplexity = async (action: string, method: 'GET' | 'POST' = 'POST', body: any = {}): Promise<any> => {
  try {
    // Отправляем запрос к Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'perplexity',
        endpoint: action,
        method,
        body
      }
    });

    if (error) {
      console.error('Ошибка при вызове AI Proxy функции Perplexity:', error);
      throw new Error(`Ошибка Edge Function: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Ошибка при запросе к Perplexity через Supabase:', error);
    throw error;
  }
};

// Для совместимости с существующим кодом
export const searchViaAbacus = searchViaPerplexity;
