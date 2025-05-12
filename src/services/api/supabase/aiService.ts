import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { BrandSuggestion } from '@/services/types';
import { getSupabaseAnonKey, getSupabaseURL } from './config';

const supabaseUrl = getSupabaseURL();
const supabaseAnonKey = getSupabaseAnonKey();

console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

interface AICallParams {
  provider: string;  // Изменяем тип с 'openai' | 'abacus' на string для поддержки 'perplexity'
  prompt?: string;
  endpoint?: string;
  method?: string;
  data?: any;
}

/**
 * Вызов AI через Supabase Edge Function
 * @param provider Провайдер AI ('openai' или 'abacus')
 * @param prompt Текст запроса (для OpenAI)
 * @param endpoint Эндпоинт для вызова (для Abacus)
 * @param method HTTP метод (GET, POST, и т.д.)
 * @param data Данные для отправки в теле запроса
 * @returns Ответ от Edge Function
 */
export const callAIViaSupabase = async (params: AICallParams): Promise<any> => {
  try {
    const { provider, prompt, endpoint, method, data } = params;

    console.log(`Вызов Edge Function для AI ${provider}:`, {
      prompt,
      endpoint,
      method,
      data
    });

    // Вызываем Edge Function
    const { data: response, error } = await supabase.functions.invoke(`ai-proxy`, {
      body: {
        provider,
        prompt,
        endpoint,
        method,
        data
      }
    });

    if (error) {
      console.error('Ошибка при вызове Edge Function:', error);
      throw new Error(`Ошибка Edge Function: ${error.message}`);
    }

    console.log('Ответ от Edge Function:', response);
    return response;
  } catch (error: any) {
    console.error('Ошибка при вызове AI через Supabase:', error);
    throw error;
  }
};

/**
 * Получение предложений брендов через OpenAI с использованием Supabase Edge Function
 * @param description Описание товара
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Вызываем Edge Function для получения предложений брендов
    const response = await callAIViaSupabase({
      provider: 'openai',
      prompt: `Ты эксперт по брендам и товарам. Назови 5-6 популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 
    
      Для каждого бренда укажи название товара и краткое описание. 
      
      ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON без дополнительных комментариев. Не возвращай один объект, только массив объектов.
      
      Формат JSON:
      [
        {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
        {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"},
        ... и так далее
      ]`
    });

    // Проверяем, что ответ существует и содержит данные
    if (!response) {
      throw new Error('Пустой ответ от Edge Function');
    }

    // Преобразуем ответ в массив BrandSuggestion
    const suggestions = JSON.parse(response);

    // Проверяем, что suggestions это массив
    if (!Array.isArray(suggestions)) {
      throw new Error('Неверный формат ответа от Edge Function: ожидался массив');
    }

    return suggestions as BrandSuggestion[];
  } catch (error: any) {
    console.error('Ошибка при получении предложений брендов через Supabase:', error);
    throw error;
  }
};
