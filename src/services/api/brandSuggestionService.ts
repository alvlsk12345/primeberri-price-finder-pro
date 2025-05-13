
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

// Храним результат последней проверки соединения
let lastConnectionCheck = {
  timestamp: 0,
  isConnected: false,
  isUsingBackend: false
};

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings") ||
         document.body.getAttribute('data-path') === '/settings';
};

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    // Проверяем, находимся ли мы на странице настроек
    if (isOnSettingsPage()) {
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
    } else {
      // Делаем новую проверку, если кеш устарел
      supabaseConnected = await isSupabaseConnected(false); // НЕ делаем принудительную проверку
      lastConnectionCheck = {
        timestamp: currentTime,
        isConnected: supabaseConnected,
        isUsingBackend: useSupabase
      };
    }
    
    if (useSupabase && supabaseConnected) {
      try {
        // Вызов AI через Supabase Edge Function
        const result = await fetchBrandSuggestionsViaOpenAI(description);
        
        // Проверка на валидность данных
        if (!result) {
          return [];
        }
        
        return result; // Функция fetchBrandSuggestionsViaOpenAI теперь всегда возвращает BrandSuggestion[]
      } catch (error) {
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
    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено", { duration: 5000 });
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    return []; // Возвращаем пустой массив при ошибке
  }
};
