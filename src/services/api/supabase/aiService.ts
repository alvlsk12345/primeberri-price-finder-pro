import { supabase } from '@/integrations/supabase/client';
import { BrandSuggestion, BrandResponse } from "@/services/types";
import { OpenAIRequestOptions } from "../openai/proxyUtils";
import { isOnSettingsPage, getRouteInfo } from '@/utils/navigation';

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
  console.log(`[supabase/aiService] ВЫЗОВ callAIViaSupabase с параметрами: ${JSON.stringify(params)}`);
  console.log(`[supabase/aiService] isOnSettingsPage()=${isOnSettingsPage()}, window.location.hash="${window.location.hash}", document.body.getAttribute('data-path')="${document.body.getAttribute('data-path')}"`);
  
  if (!supabase) {
    const error = new Error('Supabase client не инициализирован');
    console.error('[supabase/aiService] Ошибка:', error);
    throw error;
  }
  
  // Получаем текущий маршрут
  const routeInfo = getRouteInfo();
  console.log(`[supabase/aiService] Текущий маршрут: ${JSON.stringify(routeInfo)}`);
  
  // Проверка: не находимся ли мы на странице настроек
  if (routeInfo.isSettings) {
    const error = new Error('Операция не поддерживается на странице настроек');
    console.log('[supabase/aiService] Вызов предотвращен на странице настроек');
    throw error;
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

    console.log(`[supabase/aiService] Отправка запроса к Supabase Edge Function: ai-proxy, провайдер: ${params.provider}`, requestBody);
    
    // Вызываем Edge Function для запроса к AI с таймаутом
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: requestBody
    });
    
    if (error) {
      console.error('[supabase/aiService] Ошибка при вызове Supabase Edge Function:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }
    
    if (!data) {
      console.warn('[supabase/aiService] Пустой ответ от Supabase Edge Function');
    } else {
      console.log('[supabase/aiService] Получен ответ от Supabase Edge Function:', data);
    }
    
    return data;
  } catch (error) {
    // Проверяем текущий маршрут при ошибке
    const currentRouteInfo = getRouteInfo();
    
    // Если мы в процессе перехода на страницу настроек, подавляем логи
    if (currentRouteInfo.isSettings) {
      console.log('[supabase/aiService] Подавлена ошибка во время перехода на страницу настроек');
    } else {
      console.error('[supabase/aiService] Ошибка при вызове AI через Supabase:', error);
    }
    throw error;
  }
};

/**
 * Функция для поиска через OpenAI API через Supabase Edge Function
 */
export const searchViaOpenAI = async (prompt: string, options?: OpenAIRequestOptions): Promise<any> => {
  // Проверка: не находимся ли мы на странице настроек
  if (isOnSettingsPage()) {
    console.log('searchViaOpenAI: Вызов предотвращен на странице настроек');
    throw new Error('Операция не поддерживается на странице настроек');
  }
  
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
  // Проверка: не находимся ли мы на странице настроек
  if (isOnSettingsPage()) {
    console.log('searchViaAbacus: Вызов предотвращен на странице настроек');
    throw new Error('Операция не поддерживается на странице настроек');
  }
  
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
  console.log(`[supabase/aiService] ВЫЗОВ fetchBrandSuggestionsViaOpenAI с описанием: "${description}"`);
  console.log(`[supabase/aiService] isOnSettingsPage()=${isOnSettingsPage()}, window.location.hash="${window.location.hash}", document.body.getAttribute('data-path')="${document.body.getAttribute('data-path')}"`);
  
  // Получаем текущий маршрут
  const routeInfo = getRouteInfo();
  console.log(`[supabase/aiService] Текущий маршрут: ${JSON.stringify(routeInfo)}`);
  
  // Проверка: не находимся ли мы на странице настроек
  if (routeInfo.isSettings) {
    console.log('[supabase/aiService] Вызов fetchBrandSuggestionsViaOpenAI предотвращен на странице настроек');
    throw new Error('Операция не поддерживается на странице настроек');
  }
  
  if (!supabase) {
    const error = new Error('Supabase client не инициализирован');
    console.error('[supabase/aiService] Ошибка:', error);
    throw error;
  }
  
  try {
    console.log('[supabase/aiService] Вызов AI через Supabase Edge Function: openai для получения предложений брендов');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Превышено время ожидания ответа от Supabase Edge Function')), 45000); // Увеличиваем таймаут до 45 секунд
    });

    // Создаем основной запрос
    console.log('[supabase/aiService] Отправка запроса к Supabase Edge Function: ai-proxy для получения предложений брендов');
    const requestPromise = supabase.functions.invoke('ai-proxy', {
      body: { 
        provider: 'openai',
        action: 'getBrandSuggestions',
        description,
        count: 6 // Изменяем с 5 на 6 запрашиваемых результатов
      }
    });

    // Используем Promise.race для ограничения времени ожидания
    const result = await Promise.race([requestPromise, timeoutPromise]);
    
    // Проверяем результат
    const { data, error } = result as { data: any, error: any };
    
    if (error) {
      console.error('[supabase/aiService] Ошибка при вызове Supabase Edge Function:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }
    
    if (!data) {
      console.warn('[supabase/aiService] Пустой ответ от Supabase Edge Function');
      return [];
    }
    
    console.log('[supabase/aiService] Результат от fetchBrandSuggestionsViaOpenAI:', data);
    
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
      console.log('[supabase/aiService] Нормализованные результаты из массива:', normalizedResults);
    } else if (data && typeof data === 'object') {
      // Проверяем наличие поля products
      if ('products' in data && Array.isArray((data as any).products)) {
        const products = (data as any).products;
        normalizedResults = products
          .filter((item: any) => item && typeof item === 'object')
          .map((item: any) => ({
            brand: item.brand || item.name || 'Неизвестный бренд',
            product: item.product || '',
            description: item.description || 'Описани�� недоступно',
            // Сохраняем оригинальные данные для совместимости
            ...item
          }));
        console.log('[supabase/aiService] Нормализованные результаты из поля products:', normalizedResults);
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
    
    console.log('[supabase/aiService] Финальные нормализованные результаты (количество):', normalizedResults.length);
    
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
    // Проверяем текущий маршрут при ошибке
    const currentRouteInfo = getRouteInfo();
    
    // Если мы в процессе перехода на страницу настроек, подавляем логи
    if (currentRouteInfo.isSettings) {
      console.log('[supabase/aiService] Подавлена ошибка во время перехода на страницу настроек');
    } else {
      console.error('[supabase/aiService] Ошибка при получении предложений брендов через Supabase:', error);
    }
    throw error;
  }
};
