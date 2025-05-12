import { supabase } from './client';
import { BrandSuggestion, BrandResponse } from "@/services/types";
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
    
    // Вызываем Edge Function для запроса к AI с таймаутом
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

/**
 * Функция для получения предложений брендов через OpenAI API через Supabase Edge Function
 * @param description Описание запроса
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  if (!supabase) {
    throw new Error('Supabase client не инициализирован');
  }
  
  try {
    console.log('Вызов AI через Supabase Edge Function: openai');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Превышено время ожидания ответа от Supabase Edge Function')), 20000);
    });

    // Создаем основной запрос
    const requestPromise = supabase.functions.invoke('ai-proxy', {
      body: { 
        provider: 'openai',
        action: 'getBrandSuggestions',
        description,
        count: 5 // Запрашиваем 5 результатов
      }
    });

    // Используем Promise.race для ограничения времени ожидания
    const result = await Promise.race([requestPromise, timeoutPromise]);
    
    // Проверяем результат
    const { data, error } = result as { data: any, error: any };
    
    if (error) {
      console.error('Ошибка при вызове Supabase Edge Function:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }
    
    if (!data) {
      console.warn('Пустой ответ от Supabase Edge Function');
      return [];
    }
    
    console.log('Результат от fetchBrandSuggestionsViaOpenAI:', data);
    
    // Нормализация результатов
    let normalizedResults: BrandSuggestion[] = [];
    
    if (Array.isArray(data)) {
      // Если результат уже массив
      normalizedResults = data;
    } else if (data && typeof data === 'object') {
      // Проверяем наличие поля products
      if ('products' in data && Array.isArray((data as any).products)) {
        normalizedResults = (data as any).products;
      } else {
        // Если это одиночный объект с нужными полями
        if ('brand' in data || 'name' in data) {
          normalizedResults = [data as BrandSuggestion];
        }
      }
    }
    
    console.log('Нормализованные результаты:', normalizedResults);
    
    // Убедимся, что все объекты в массиве имеют нужную структуру
    return normalizedResults.map(item => ({
      brand: item.brand || item.name || 'Неизвестный бренд',
      product: item.product || '',
      description: item.description || 'Описание недоступно'
    }));
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через Supabase:', error);
    throw error;
  }
};
