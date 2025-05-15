
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
    
    // Если пришел некорректный формат, возвращаем пустой ма��сив
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
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;

    // Формируем данные запроса для Perplexity
    const requestData = {
      model: "sonar", // Используем модель sonar
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: description }
      ],
      temperature: 0.7,
      max_tokens: 300 // Ограничение в 300 токенов
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
    
    // Обработка ответа от Perplexity с улучшенной обработкой ошибок
    if (data && data.choices && data.choices[0]?.message?.content) {
      try {
        const content = data.choices[0].message.content;
        console.log("Контент ответа от Perplexity:", content);
        
        // Безопасный парсинг JSON с обработкой ошибок
        try {
          const parsedContent = JSON.parse(content);
          
          if (parsedContent && parsedContent.products && Array.isArray(parsedContent.products)) {
            console.log("Успешно получены предложения брендов от Perplexity:", parsedContent.products.length);
            return parsedContent.products;
          } else {
            console.warn("Получен некорректный формат ответа от Perplexity (отсутствует массив products):", parsedContent);
            return [];
          }
        } catch (parseError) {
          console.error("Ошибка при парсинге JSON от Perplexity:", parseError);
          console.log("Попытка восстановления поврежденного JSON...");
          
          // Попытка исправить простые проблемы с JSON
          // Проверяем наличие текста "products" в контенте, если есть, пытаемся извлечь массив
          if (content.includes("products")) {
            const productsMatch = content.match(/\{\s*"products"\s*:\s*\[(.*)\]\s*\}/s);
            if (productsMatch && productsMatch[1]) {
              try {
                // Пытаемся восстановить только содержимое массива products
                const itemsJson = `[${productsMatch[1]}]`;
                console.log("Извлеченный массив products:", itemsJson);
                
                const items = JSON.parse(itemsJson);
                console.log("Восстановленный массив товаров:", items);
                
                if (Array.isArray(items) && items.length > 0) {
                  return items;
                }
              } catch (e) {
                console.error("Не удалось восстановить массив products:", e);
              }
            }
          }
          
          // Если все попытки восстановления не удались, возвращаем пустой массив
          return [];
        }
      } catch (error) {
        console.error("Критическая ошибка при обработке ответа от Perplexity:", error);
        return [];
      }
    } else if (data && typeof data === 'object') {
      // Проверяем другие возможные форматы ответа
      if ('products' in data && Array.isArray(data.products)) {
        return data.products;
      } else if (Array.isArray(data)) {
        return data;
      }
    }
    
    // Если формат не распознан или данные отсутствуют, возвращаем пустой массив
    console.warn("Не удалось извлечь предложения брендов из ответа Perplexity");
    return [];
    
  } catch (error) {
    console.error("Ошибка при получении предложений брендов через Perplexity (Supabase):", error);
    return [];
  }
};
