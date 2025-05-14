
import { SearchParams, SearchResult } from "@/services/types";
import { callOpenAI } from "./apiClient";
import { toast } from "@/components/ui/use-toast";

export const fetchFromOpenAI = async (searchParams: SearchParams): Promise<SearchResult> => {
  try {
    // Заглушка для поиска через OpenAI
    toast.error("Поиск через OpenAI временно недоступен. Используйте другой источник данных.", { 
      duration: 5000
    });
    
    return {
      products: [],
      totalPages: 0,
      isDemo: true,
      apiInfo: {
        source: "OpenAI",
        status: "Недоступно"
      }
    };
  } catch (error) {
    console.error("Ошибка при поиске через OpenAI:", error);
    throw error;
  }
};
