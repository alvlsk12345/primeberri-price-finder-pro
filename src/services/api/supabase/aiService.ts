
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
        provider: 'perplexity', // Изменено с 'abacus' на 'perplexity' для ясности
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

/**
 * Получает предложения брендов через Perplexity с использованием Supabase Edge Function
 */
export const fetchBrandSuggestionsViaPerplexity = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    console.log("Получение предложений брендов через Perplexity (Supabase):", description);
    
    // Системный промпт для формата JSON
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя. Ищи товары только в странах европейского союза.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;

    // Формируем данные запроса для Perplexity - ИСПРАВЛЕНО
    const requestData = {
      model: "sonar", // Заменено на sonar
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: description }
      ],
      temperature: 0.1,  // Оставляем температуру 0.1
      max_tokens: 500    // Увеличиваем с 300 до 500 токенов
      // Удален параметр response_format, который вызывал ошибку
    };
    
    // Вызываем Edge Function для получения предложений брендов
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        provider: 'perplexity',
        action: 'getBrandSuggestions',
        description: description,
        count: 6,
        requestData: requestData
      }
    });

    if (error) {
      console.error("Ошибка при получении предложений брендов через Perplexity (Supabase):", error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }

    console.log("Предложения брендов от Perplexity через Supabase Edge Function:", data);
    
    // Обработка ответа от Perplexity
    if (data && data.choices && data.choices[0]?.message?.content) {
      try {
        const content = data.choices[0].message.content;
        const parsedContent = JSON.parse(content);
        
        if (parsedContent && parsedContent.products && Array.isArray(parsedContent.products)) {
          console.log("Успешно получены предложения брендов от Perplexity:", parsedContent.products.length);
          return parsedContent.products;
        }
      } catch (parseError) {
        console.error("Ошибка при парсинге JSON от Perplexity:", parseError);
      }
    }
    
    // Если пришел некорректный формат, возвращаем пустой массив
    return [];
    
  } catch (error) {
    console.error("Ошибка при получении предложений брендов через Perplexity (Supabase):", error);
    return [];
  }
};
