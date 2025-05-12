
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
    } else {
      console.log('Получен ответ от Supabase Edge Function:', data);
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
    console.log('Вызов AI через Supabase Edge Function: openai для получения предложений брендов');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Превышено время ожидания ответа от Supabase Edge Function')), 45000); // Увеличиваем таймаут до 45 секунд
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
      normalizedResults = data
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          brand: item.brand || item.name || 'Неизвестный бренд',
          product: item.product || '',
          description: item.description || 'Описание недоступно',
          // Сохраняем оригинальные данные для совместимости
          ...item
        }));
      console.log('Нормализованные результаты из массива:', normalizedResults);
    } else if (data && typeof data === 'object') {
      // Проверяем наличие поля products
      if ('products' in data && Array.isArray((data as any).products)) {
        const products = (data as any).products;
        normalizedResults = products
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => ({
            brand: item.brand || item.name || 'Неизвестный бренд',
            product: item.product || '',
            description: item.description || 'Описание недоступно',
            // Сохраняем оригинальные данные для совместимости
            ...item
          }));
        console.log('Нормализованные результаты из поля products:', normalizedResults);
      } else {
        // Если это одиночный объект с нужными полями
        if ('brand' in data || 'name' in data) {
          normalizedResults = [{
            brand: data.brand || data.name || 'Неизвестный бренд',
            product: data.product || '',
            description: data.description || 'Описание недоступно',
            // Сохраняем оригинальные данные для совместимости
            ...data
          }];
          console.log('Одиночный объект преобразован в массив:', normalizedResults);
        }
      }
    }
    
    console.log('Финальные нормализованные результаты (количество):', normalizedResults.length);
    
    // Убедимся, что все объекты в массиве имеют нужную структуру и удаляем дубликаты
    const uniqueBrands = new Set();
    const uniqueResults = normalizedResults
      .filter(item => item && (item.brand || item.product))
      .filter(item => {
        const key = `${item.brand || ''}_${item.product || ''}`;
        if (uniqueBrands.has(key)) {
          return false;
        }
        uniqueBrands.add(key);
        return true;
      });
    
    return uniqueResults;
  } catch (error) {
    console.error('Ошибка при получении предложений брендов через Supabase:', error);
    throw error;
  }
};
