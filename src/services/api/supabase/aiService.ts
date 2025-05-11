
import { supabase } from './client';
import { BrandSuggestion } from "@/services/types";

// Функция для получения предложений брендов через OpenAI API через Supabase Edge Function
export const fetchBrandSuggestionsViaOpenAI = async (description: string): Promise<BrandSuggestion[]> => {
  if (!supabase) {
    throw new Error('Supabase client не инициализирован');
  }
  
  try {
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
    
    // Обработка ответа в зависимости от формата
    // Может быть массив объектов BrandSuggestion или один объект
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object') {
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
