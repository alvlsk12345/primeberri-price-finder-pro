
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

// Кэш предложений брендов по запросам
const brandSuggestionsCache: Map<string, {timestamp: number, suggestions: BrandSuggestion[]}> = new Map();
const SUGGESTIONS_CACHE_TTL = 3600000; // 1 час

/**
 * Получение кэшированных предложений брендов по описанию
 * @param description Описание товара
 * @returns Кэшированные предложения или null, если кэш не найден или устарел
 */
const getCachedSuggestions = (description: string): BrandSuggestion[] | null => {
  const normalizedDesc = description.trim().toLowerCase();
  const cachedItem = brandSuggestionsCache.get(normalizedDesc);
  
  if (cachedItem && (Date.now() - cachedItem.timestamp < SUGGESTIONS_CACHE_TTL)) {
    console.log('Используем кэшированные предложения брендов для запроса:', normalizedDesc);
    return cachedItem.suggestions;
  }
  
  return null;
};

/**
 * Сохранение предложений брендов в кэш
 * @param description Описание товара
 * @param suggestions Предложения брендов
 */
const cacheSuggestions = (description: string, suggestions: BrandSuggestion[]): void => {
  const normalizedDesc = description.trim().toLowerCase();
  
  // Ограничиваем размер кэша (максимум 50 запросов)
  if (brandSuggestionsCache.size >= 50) {
    // Находим и удаляем самую старую запись
    let oldestKey = '';
    let oldestTime = Date.now();
    
    brandSuggestionsCache.forEach((value, key) => {
      if (value.timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = value.timestamp;
      }
    });
    
    if (oldestKey) {
      brandSuggestionsCache.delete(oldestKey);
      console.log('Удалена самая старая запись из кэша предложений:', oldestKey);
    }
  }
  
  // Сохраняем новые предложения в кэш
  brandSuggestionsCache.set(normalizedDesc, {
    timestamp: Date.now(),
    suggestions
  });
  
  console.log('Предложения брендов сохранены в кэш для запроса:', normalizedDesc);
};

// Основная функция получения брендов, которая выбирает подходящий провайдер
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  // Проверяем кэш перед запросом
  const cachedSuggestions = getCachedSuggestions(description);
  if (cachedSuggestions) {
    return cachedSuggestions;
  }
  
  // Получаем текущего провайдера
  const provider = getSelectedAIProvider();
  
  try {
    console.log(`Используем ${provider} для получения предложений брендов`);
    
    // Уменьшаем время ожидания с помощью Promise.race и таймаута
    const timeoutPromise = new Promise<BrandSuggestion[]>((_, reject) => {
      setTimeout(() => reject(new Error('Таймаут запроса предложений брендов')), 12000); // 12 секунд
    });
    
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
        // Вызов AI через Supabase Edge Function с таймаутом
        console.log('Вызов AI через Supabase Edge Function:', provider);
        
        toast.loading('Получение рекомендаций AI...', {
          id: 'ai-suggestion-loading',
          duration: 12000
        });
        
        const result = await Promise.race([
          fetchBrandSuggestionsViaOpenAI(description),
          timeoutPromise
        ]);
        
        toast.dismiss('ai-suggestion-loading');
        
        console.log('Результат от Supabase:', result);
        
        // Проверка на валидность данных
        if (!result || result.length === 0) {
          console.warn('Пустой ответ от Supabase Edge Function');
          return [];
        }
        
        // Кэшируем полученные предложения
        cacheSuggestions(description, result);
        
        return result; // Функция fetchBrandSuggestionsViaOpenAI теперь всегда возвращает BrandSuggestion[]
      } catch (error) {
        toast.dismiss('ai-suggestion-loading');
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
    toast.error("Прямые запросы к OpenAI API из браузера блокируются политикой CORS. Пожалуйста, используйте Supabase Edge Function.", { duration: 6000 });
    toast.info("Перейдите в раздел 'Настройки' и убедитесь, что 'Использовать Supabase Backend' включено", { duration: 5000 });
    
    // Возвращаем пустой массив, так как прямые вызовы API невозможны из-за CORS
    return [];
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    toast.dismiss('ai-suggestion-loading');
    return []; // Возвращаем пустой массив при ошибке
  }
};
