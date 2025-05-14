
import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai/brandSuggestion";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromPerplexity } from "./abacus/brandSuggestion";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "sonner";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidPerplexityApiKey } from "./abacus/config";
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
        // Вызов AI через Supabase Edge Function
        console.log('Вызов AI через Supabase Edge Function:', provider);
        
        // Используем perplexity или openai в зависимости от провайдера
        if (provider === 'perplexity') {
          // Для perplexity используем новый формат запроса
          const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно 6 результатов. Не нумеруй результаты.`;
          
          // Вызываем Perplexity через Edge Function
          const result = await fetchBrandSuggestionsFromPerplexity(description);
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
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                   { duration: 3000 });
        toast.info('Проверьте настройки Supabase в разделе "Настройки"', { duration: 5000 });
        
        // Возвращаем пустой массив, так как произошла ошибка
        return [];
      }
    } else if (!supabaseConnected && useSupabase) {
      toast.warning('Supabase не подключен, но выбран для использования. Проверьте настройки.', { duration: 5000 });
      return []; // Возвращаем пустой массив, так как Supabase не подключен
    }
    
    // Проверка настрок при попытке прямого вызова API
    toast.error("Прямые запросы к API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено", { duration: 5000 });
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    return []; // Возвращаем пустой массив при ошибке
  }
};
