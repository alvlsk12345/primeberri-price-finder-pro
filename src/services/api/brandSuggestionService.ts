
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
import { isOnSettingsPage, getRouteInfo } from "@/utils/navigation";

// Храним результат последней проверки соединения
let lastConnectionCheck = {
  timestamp: 0,
  isConnected: false,
  isUsingBackend: false
};

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  console.log(`[brandSuggestionService] ВЫЗОВ fetchBrandSuggestions с описанием: "${description}"`);
  console.log(`[brandSuggestionService] isOnSettingsPage()=${isOnSettingsPage()}, window.location.hash="${window.location.hash}", document.body.getAttribute('data-path')="${document.body.getAttribute('data-path')}"`);
  
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    // Получаем информацию о текущем маршруте
    const routeInfo = getRouteInfo();
    console.log(`[brandSuggestionService] Текущий маршрут: ${JSON.stringify(routeInfo)}`);
    
    // Проверяем, находимся ли мы на странице настроек с помощью центральной функции
    if (routeInfo.isSettings) {
      console.log('[brandSuggestionService] Вызов предотвращен на странице настроек');
      return []; // Возвращаем пустой массив на странице настроек
    }

    // Проверяем, используем ли мы Supabase бэкенд - без автоматической проверки соединения
    let useSupabase = await isUsingSupabaseBackend();
    let supabaseConnected = false;
    
    // Используем кешированные значения или делаем новую проверку, если прошло более 5 минут
    const currentTime = Date.now();
    const cacheExpiration = 5 * 60 * 1000; // 5 минут в миллисекундах
    
    if (currentTime - lastConnectionCheck.timestamp < cacheExpiration) {
      // Используем кешированные значения
      supabaseConnected = lastConnectionCheck.isConnected;
      console.log('[brandSuggestionService] Используем кешированные данные о соединении:', 
                  { connected: supabaseConnected, enabled: useSupabase });
    } else {
      // Делаем новую проверку, если кеш устарел
      console.log('[brandSuggestionService] Выполняем новую проверку соединения с Supabase');
      supabaseConnected = await isSupabaseConnected(false); // НЕ делаем принудительную проверку
      lastConnectionCheck = {
        timestamp: currentTime,
        isConnected: supabaseConnected,
        isUsingBackend: useSupabase
      };
      console.log('[brandSuggestionService] Результат проверки соединения:', 
                  { connected: supabaseConnected, enabled: useSupabase });
    }
    
    if (useSupabase && supabaseConnected) {
      try {
        // Повторная проверка текущего маршрута для надежности
        const currentRouteInfo = getRouteInfo();
        if (currentRouteInfo.isSettings) {
          console.log('[brandSuggestionService] Повторная проверка, вызов предотвращен на странице настроек');
          return [];
        }
        
        console.log('[brandSuggestionService] Вызываем fetchBrandSuggestionsViaOpenAI через Supabase Edge Function');
        // Вызов AI через Supabase Edge Function
        const result = await fetchBrandSuggestionsViaOpenAI(description);
        
        // Проверка на валидность данных
        if (!result) {
          console.warn('[brandSuggestionService] Получен пустой результат от Supabase Edge Function');
          return [];
        }
        
        console.log('[brandSuggestionService] Успешно получены данные от Supabase Edge Function:', result);
        return result; // Функция fetchBrandSuggestionsViaOpenAI теперь всегда возвращает BrandSuggestion[]
      } catch (error) {
        // Проверяем текущий маршрут при ошибке
        const currentRouteInfo = getRouteInfo();
        
        // Если мы в процессе перехода на страницу настроек, подавляем ошибки
        if (currentRouteInfo.isSettings) {
          console.log('[brandSuggestionService] Подавлена ошибка во время перехода на страницу настроек');
          return [];
        }
        
        console.error('[brandSuggestionService] Ошибка при вызове Supabase Edge Function:', error);
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                   { duration: 3000 });
        toast.info('Проверьте настройки Supabase в разделе "Настройки"', { duration: 5000 });
        
        // Возвращаем пустой массив, так как произошла ошибка
        return [];
      }
    } else if (!supabaseConnected && useSupabase) {
      console.warn('[brandSuggestionService] Supabase не подключен, но выбран для использования');
      toast.warning('Supabase не подключен, но выбран для использования. Проверьте настройки.', { duration: 5000 });
      return []; // Возвращаем пустой массив, так как Supabase не подключен
    }
    
    // Проверка настрок при попытке прямого вызова API
    console.error('[brandSuggestionService] Прямые запросы к OpenAI API блокируются CORS-политикой');
    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено", { duration: 5000 });
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    // Получаем текущий маршрут при ошибке
    const currentRouteInfo = getRouteInfo();
    
    // Если мы в процессе перехода на страницу настроек, подавляем ошибки
    if (currentRouteInfo.isSettings) {
      console.log('[brandSuggestionService] Подавлена ошибка во время перехода на страницу настроек');
    } else {
      console.error('[brandSuggestionService] Ошибка при получении предложений брендов:', error);
    }
    return []; // Возвращаем пустой массив при ошибке
  }
};
