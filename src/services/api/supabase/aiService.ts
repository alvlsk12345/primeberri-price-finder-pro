
import { supabase } from './client';
import { BrandSuggestion } from "@/services/types";
import { OpenAIRequestOptions } from "../openai/proxyUtils";

/**
 * Универсальная функция для вызова AI через Supabase Edge Function
 */
export const callAIViaSupabase = async (params: {
  provider: 'openai' | 'abacus';
  prompt?: string;
  options?: OpenAIRequestOptions;
  endpoint?: string;
  method?: 'GET' | 'POST';
  body?: any;
}): Promise<any> => {
  if (!supabase) {
    throw new Error('Supabase client не инициализирован');
  }
  
  try {
    // Формируем тело запроса к Edge Function
    const requestBody = {
      provider: params.provider,
      ...(params.prompt && { prompt: params.prompt }),
      ...(params.options && { options: params.options }),
      ...(params.endpoint && { endpoint: params.endpoint }),
      ...(params.method && { method: params.method }),
      ...(params.body && { body: params.body }),
    };

    console.log(`Отправка запроса к Supabase Edge Function: ai-proxy, провайдер: ${params.provider}`, requestBody);
    
    // Вызываем Edge Function для запроса к AI
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: requestBody
    });
    
    if (error) {
      console.error('Ошибка при вызове Supabase Edge Function:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }
    
    if (!data) {
      console.warn('Пустой ответ от Supabase Edge Function');
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка при вызове AI через Supabase:', error);
    throw error;
  }
};

/**
 * Функция для поиска через OpenAI API через Supabase Edge Function
 */
export const searchViaOpenAI = async (prompt: string, options?: OpenAIRequestOptions): Promise<any> => {
  try {
    return await callAIViaSupabase({
      provider: 'openai',
      prompt,
      options
    });
  } catch (error) {
    console.error('Ошибка при поиске через OpenAI (Supabase):', error);
    throw error;
  }
};

/**
 * Функция для поиска через Abacus API через Supabase Edge Function
 */
export const searchViaAbacus = async (endpoint: string, method: 'GET' | 'POST' = 'POST', body?: any): Promise<any> => {
  try {
    return await callAIViaSupabase({
      provider: 'abacus',
      endpoint,
      method,
      body
    });
  } catch (error) {
    console.error('Ошибка при поиске через Abacus (Supabase):', error);
    throw error;
  }
};

// Функция для получения предложений брендов через OpenAI API через Supabase Edge Function
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  if (!supabase) {
    throw new Error('Supabase client не инициализирован');
  }
  
  try {
    console.log('Вызов AI через Supabase Edge Function: openai');
    
    // Вызываем Edge Function для запроса к OpenAI
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { 
        provider: 'openai',
        action: 'getBrandSuggestions',
        description,
        count: 5 // Запрашиваем 5 результатов
      }
    });
    
    if (error) {
      console.error('Ошибка при вызове Supabase Edge Function:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }
    
    if (!data) {
      console.warn('Пустой ответ от Supabase Edge Function');
      return [];
    }
    
    console.log('Результат от fetchBrandSuggestionsViaOpenAI:', data);
    
    // Проверка на валидность полученных данных
    if (!data) {
      console.warn('Пустой ответ от Supabase Edge Function');
      return [];
    }
    
    // Обработка разных форматов ответа от OpenAI
    if (Array.isArray(data)) {
      // Если data уже массив объектов BrandSuggestion
      return data;
    } else if (typeof data === 'object') {
      // Проверяем, если пришел объект с полем products (результат от модели GPT)
      if (data.products && Array.isArray(data.products)) {
        return data.products;
      }
      
      // Проверяем, имеет ли объект нужные свойства для BrandSuggestion
      if (data.brand || data.name) {
        return [data as BrandSuggestion];
      }
      
      // Проверяем, есть ли вложенное поле suggestions или results
      if (data.suggestions) {
        return Array.isArray(data.suggestions) ? data.suggestions : [data.suggestions];
      }
      
      if (data.results) {
        return Array.isArray(data.results) ? data.results : [data.results];
      }
    }
    
    console.warn('Неизвестный формат ответа от Supabase Edge Function:', data);
    return [];
    
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через Supabase:', error);
    throw error;
  }
};
