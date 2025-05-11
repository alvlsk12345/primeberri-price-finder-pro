
import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromAbacus } from "./abacus";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "sonner";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidAbacusApiKey } from "./abacus/config";
import { isUsingSupabaseBackend } from "./supabase/config";
import { isSupabaseConnected } from "./supabase/client";
import { fetchBrandSuggestionsViaOpenAI } from "./supabase/aiService";

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
        const result = await fetchBrandSuggestionsViaOpenAI(description);
        console.log('Результат от Supabase:', result);
        return result;
      } catch (error) {
        console.error('Ошибка при использовании Supabase для предложений брендов:', error);
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                   { duration: 3000 });
        toast.info('Проверьте настройки Supabase в разделе "Настройки"', { duration: 5000 });
        
        // Продолжаем с обычным процессом, если Supabase не сработал
      }
    } else if (!supabaseConnected && useSupabase) {
      toast.warning('Supabase не подключен, но выбран для использования. Проверьте настройки.', { duration: 5000 });
    }
    
    // Проверка настрок при попытке прямого вызова API
    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено", { duration: 5000 });
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    return []; // Возвращаем пустой массив при ошибке
  }
};
