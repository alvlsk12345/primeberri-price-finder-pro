
import { SearchParams, SearchResult } from "../../types";
import { searchViaPerplexity } from "../supabase/aiService";

// Экспортируем все необходимые функции из подмодулей
export { getApiKey, setApiKey, hasValidApiKey, resetApiKey, API_BASE_URL } from './config';
export { callPerplexityAI, generateTextViaAbacus } from './apiClient';
export { fetchBrandSuggestions } from './brandSuggestion';

export const searchProductsViaAbacus = async (params: SearchParams): Promise<SearchResult> => {
  try {
    // Реализация запроса к API Abacus/Perplexity
    // ...

    // Заглушка для возврата результатов
    return {
      products: [],
      totalPages: 0,
      isDemo: true
    };
  } catch (error) {
    console.error("Ошибка при запросе к Perplexity API:", error);
    throw error;
  }
};
