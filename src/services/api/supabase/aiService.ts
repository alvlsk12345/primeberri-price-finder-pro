
import { SearchParams, SearchResult } from "@/services/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Выполняет запрос к OpenAI через Supabase Edge Function
 */
export const searchViaOpenAI = async (prompt: string, options: any = {}): Promise<any> => {
  try {
    console.log("Вызов OpenAI через Supabase Edge Function:", { prompt, options });
    
    // Заглушка, которая возвращает ошибку
    throw new Error("Функция searchViaOpenAI не реализована");
    
  } catch (error) {
    console.error("Ошибка при вызове OpenAI через Supabase:", error);
    throw error;
  }
};
