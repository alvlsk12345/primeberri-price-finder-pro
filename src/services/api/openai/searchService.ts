import { hasValidApiKey } from "./config";
import { callOpenAI } from "./apiClient";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { SearchResult } from "@/services/types";
import { isUsingSupabase } from "../supabase/config";
import { isSupabaseConnected, supabase } from "@/integrations/supabase/client";

// Функция для поиска товаров через OpenAI
export const fetchFromOpenAI = async (query: string): Promise<SearchResult> => {
  // Проверяем, используем ли мы Supabase backend
  const useSupabase = await isUsingSupabase();
  const supabaseConnected = await isSupabaseConnected();
  
  console.log('Статус Supabase для поиска:', {
    используется: useSupabase,
    подключен: supabaseConnected
  });
  
  if (useSupabase && supabaseConnected) {
    console.log('Использование Supabase Edge Function для поиска');
    try {
      // Вызываем Edge Function
      const { data, error } = await supabase.functions.invoke('search-products', {
        body: { query }
      });
      
      if (error) {
        console.error("Ошибка при вызове Edge Function:", error);
        throw new Error(`Ошибка при вызове Supabase Edge Function: ${error.message}`);
      }
      
      console.log('Результат от Edge Function:', data);
      return data as SearchResult;
    } catch (supabaseError: any) {
      console.error("Ошибка при использовании Supabase Edge Function:", supabaseError);
      throw new Error(`Ошибка при использовании Supabase: ${supabaseError.message}`);
    }
  } else {
    console.warn('Прямой вызов OpenAI API из браузера не рекомендуется из-за CORS.');
    console.warn('Включите "Использовать Supabase Backend" в настройках для использования Edge Functions.');
    throw new Error('Прямой вызов OpenAI API из браузера не рекомендуется. Используйте Supabase Edge Functions.');
  }
  
  // Если Supabase не используется или не подключен, возвращаем моковые данные
  console.log('Использование моковых данных для поиска');
  return generateMockSearchResults(query);
};
