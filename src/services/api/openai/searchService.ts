
import { SearchParams, SearchResult } from "../../types";
import { toast } from "@/components/ui/use-toast";
import { isUsingSupabaseBackend } from "../supabase/config";
import { isSupabaseConnected } from "../supabase/client";
import { searchViaOpenAI } from "../supabase/aiService";
import { createMockProductsFromQuery } from "./responseUtils";

export const fetchFromOpenAI = async (params: SearchParams): Promise<SearchResult> => {
  try {
    // Проверка на использование Supabase
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log("Используем Supabase для запроса к OpenAI:", params);
      
      // Отправляем запрос через Supabase Edge Function
      const response = await searchViaOpenAI(params, {
        model: "gpt-4o",
        temperature: 0.3,
        max_tokens: 1500,
        responseFormat: "json_object"
      });
      
      console.log("Ответ от OpenAI через Supabase:", response);
      
      // Обрабатываем ответ
      if (response && typeof response === 'object') {
        if ('products' in response) {
          return {
            products: response.products,
            total: response.products.length,
            page: 1,
            pages: 1,
            apiInfo: {
              provider: 'openai',
              model: 'gpt-4o',
              time: new Date().toISOString()
            }
          };
        }
      }
      
      // Если ответ в неожиданном формате, генерируем демо-данные
      console.warn("Ответ от OpenAI в неожиданном формате, используем демо-данные");
      return {
        products: createMockProductsFromQuery(params.query),
        total: 10,
        page: 1,
        pages: 1,
        apiInfo: {
          provider: 'openai-mock',
          model: 'mock-data',
          time: new Date().toISOString()
        }
      };
    }
    
    // Если Supabase не используется, генерируем демо-данные
    console.log("Supabase не используется, генерируем демо-данные");
    return {
      products: createMockProductsFromQuery(params.query),
      total: 10,
      page: 1,
      pages: 1,
      apiInfo: {
        provider: 'openai-mock',
        model: 'mock-data',
        time: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Ошибка при запросе к OpenAI:", error);
    toast.error(`Ошибка при запросе к OpenAI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    
    // В случае ошибки генерируем демо-данные
    return {
      products: createMockProductsFromQuery(params.query),
      total: 10,
      page: 1,
      pages: 1,
      apiInfo: {
        provider: 'openai-mock',
        model: 'mock-data',
        time: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }
    };
  }
};
