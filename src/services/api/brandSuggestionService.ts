
import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai/brandSuggestion";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromPerplexity } from "./abacus/brandSuggestion";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "@/components/ui/use-toast";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidPerplexityApiKey } from "./abacus/config";
import { isUsingSupabaseBackend } from "./supabase/config";
import { isSupabaseConnected } from "./supabase/client";
import { fetchBrandSuggestionsViaOpenAI, fetchBrandSuggestionsViaPerplexity } from "./supabase/aiService";

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    console.log(`Используем ${provider} для получения предложений брендов`);
    
    // Проверяем, используем ли мы Supabase бэкенд
    const useSupabase = await isUsingSupabaseBackend();
    const supabaseConnected = await isSupabaseConnected();
    
    console.log('Статус Supabase для бренд-сервиса:', {
      используется: useSupabase,
      подключен: supabaseConnected
    });
    
    if (useSupabase && supabaseConnected) {
      console.log('Использование Supabase бэкенда для получения предложений брендов');
      try {
        // Вызов AI через Supabase Edge Function
        console.log('Вызов AI через Supabase Edge Function:', provider);
        
        // Используем perplexity или openai в зависимости от провайдера
        if (provider === 'abacus') {
          // Для perplexity используем специализированную функцию
          const result = await fetchBrandSuggestionsViaPerplexity(description);
          console.log('Результат от Perplexity:', result);
          return result;
        } else {
          // Для OpenAI используем существующий метод
          const result = await fetchBrandSuggestionsViaOpenAI(description);
          console.log('Результат от OpenAI:', result);
          return result;
        }
      } catch (error) {
        console.error('Ошибка при использовании Supabase для предложений брендов:', error);
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        toast.info('Проверьте настройки Supabase в разделе "Настройки"');
        
        // Возвращаем пустой массив, так как произошла ошибка
        return [];
      }
    } else if (!supabaseConnected && useSupabase) {
      toast.warning('Supabase не подключен, но выбран для использования. Проверьте настройки.');
      return []; // Возвращаем пустой массив, так как Supabase не подключен
    }
    
    // Проверка настрок при попытке прямого вызова API
    toast.error("Прямые запросы к API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.");
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено");
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    return []; // Возвращаем пустой массив при ошибке
  }
};
