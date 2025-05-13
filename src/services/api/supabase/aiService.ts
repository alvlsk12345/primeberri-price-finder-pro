import { supabase } from '@/integrations/supabase/client';
import { BrandSuggestion } from '@/services/types';
import { isUsingSupabaseBackend } from './config';

// Экспортируем функции для получения URL и ключа Supabase
export const getSupabaseURL = () => "https://juacmpkewomkducoanle.supabase.co";
export const getSupabaseAnonKey = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWNtcGtld29ta2R1Y29hbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTUwNDQsImV4cCI6MjA2MjUzMTA0NH0.UMkGF_zp-aAI9F71bOCuGzr3zRbusECclCyQUJAdrqk";

interface AICallParams {
  provider: string;
  prompt?: string;
  endpoint?: string;
  method?: string;
  data?: any;
}

/**
 * Вызов AI через Supabase Edge Function
 * @param provider Провайдер AI ('openai', 'abacus' или 'perplexity')
 * @param prompt Текст запроса (для OpenAI и Perplexity)
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
 * Вызов поиска через OpenAI с использованием Edge Function
 * @param query Запрос для поиска
 * @param options Дополнительные опции
 * @returns Результат поиска
 */
export const searchViaOpenAI = async (query: string, options: any = {}): Promise<any> => {
  try {
    return await callAIViaSupabase({
      provider: 'openai',
      prompt: query,
      data: options
    });
  } catch (error) {
    console.error('Ошибка при поиске через OpenAI Edge Function:', error);
    throw error;
  }
};

/**
 * Вызов поиска через Abacus с использованием Edge Function
 * @param endpoint Эндпоинт API Abacus
 * @param method HTTP метод
 * @param data Данные для запроса
 * @returns Результат запроса к Abacus
 */
export const searchViaAbacus = async (endpoint: string, method: 'GET' | 'POST' = 'POST', data: any = {}): Promise<any> => {
  try {
    return await callAIViaSupabase({
      provider: 'abacus',
      endpoint,
      method,
      data
    });
  } catch (error) {
    console.error('Ошибка при запросе к Abacus через Edge Function:', error);
    throw error;
  }
};

/**
 * Вызов поиска через Perplexity с использованием Edge Function
 * @param query Запрос для поиска
 * @param options Дополнительные опции
 * @returns Результат поиска
 */
export const searchViaPerplexity = async (query: string, options: any = {}): Promise<any> => {
  try {
    return await callAIViaSupabase({
      provider: 'perplexity',
      prompt: query,
      data: options
    });
  } catch (error) {
    console.error('Ошибка при поиске через Perplexity Edge Function:', error);
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

    // Обработка ответа в зависимости от его формата
    let suggestions;
    if (typeof response === 'string') {
      // Если ответ - строка, пробуем распарсить её как JSON
      try {
        suggestions = JSON.parse(response);
      } catch (e) {
        console.error('Ошибка при парсинге JSON-ответа:', e);
        throw new Error('Неверный формат ответа: невозможно распарсить JSON');
      }
    } else if (Array.isArray(response)) {
      // Если ответ уже является массивом
      suggestions = response;
    } else if (response.suggestions && Array.isArray(response.suggestions)) {
      // Если ответ содержит поле suggestions, которое является массивом
      suggestions = response.suggestions;
    } else {
      // Другие форматы ответа
      console.error('Неподдерживаемый формат ответа:', response);
      throw new Error('Неверный формат ответа от Edge Function');
    }

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

/**
 * Получение предложений брендов через Perplexity с использованием Supabase Edge Function
 * @param description Описание товара
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestionsViaPerplexity = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Вызываем Edge Function для получения предложений брендов
    const response = await callAIViaSupabase({
      provider: 'perplexity',
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

    // Используем те же методы обработки что и для OpenAI
    if (!response) {
      throw new Error('Пустой ответ от Edge Function');
    }

    // Обработка ответа в зависимости от его формата
    let suggestions;
    if (typeof response === 'string') {
      try {
        suggestions = JSON.parse(response);
      } catch (e) {
        console.error('Ошибка при парсинге JSON-ответа:', e);
        throw new Error('Неверный формат ответа: невозможно распарсить JSON');
      }
    } else if (Array.isArray(response)) {
      suggestions = response;
    } else if (response.suggestions && Array.isArray(response.suggestions)) {
      suggestions = response.suggestions;
    } else {
      console.error('Неподдерживаемый формат ответа:', response);
      throw new Error('Неверный формат ответа от Edge Function');
    }

    if (!Array.isArray(suggestions)) {
      throw new Error('Неверный формат ответа от Edge Function: ожидался массив');
    }

    return suggestions as BrandSuggestion[];
  } catch (error: any) {
    console.error('Ошибка при получении предложений брендов через Supabase Perplexity:', error);
    throw error;
  }
};
