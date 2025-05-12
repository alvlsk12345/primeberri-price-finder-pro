import { BrandSuggestion } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromOpenAI } from "./openai";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromAbacus } from "./abacus";
import { fetchBrandSuggestions as fetchBrandSuggestionsFromPerplexity } from "./perplexity/brandSuggestion";
import { getSelectedAIProvider, AIProvider } from "./aiProviderService";
import { toast } from "sonner";
import { hasValidApiKey as hasValidOpenAIApiKey } from "./openai/config";
import { hasValidApiKey as hasValidAbacusApiKey } from "./abacus/config";
import { hasValidApiKey as hasValidPerplexityApiKey } from "./perplexity/config";
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
      setTimeout(() => reject(new Error('Таймаут запроса предложений брендов')), 15000); // Увеличиваем таймаут до 15 секунд
    });
    
    // Проверяем, используем ли мы Supabase бэкенд
    let useSupabaseConnected = false;
    try {
      const useSupabase = await isUsingSupabaseBackend();
      const supabaseConnected = await isSupabaseConnected();
      useSupabaseConnected = useSupabase && supabaseConnected;
      
      console.log('Статус Supabase для бренд-сервиса:', {
        используется: useSupabase,
        подключен: supabaseConnected
      });
    } catch (e) {
      console.warn('Ошибка при проверке статуса Supabase:', e);
    }
    
    // Проверка API ключей для прямого подключения
    let hasApiKey = false;
    switch (provider) {
      case 'openai':
        hasApiKey = hasValidOpenAIApiKey();
        break;
      case 'abacus':
        hasApiKey = hasValidAbacusApiKey();
        break;
      case 'perplexity':
        hasApiKey = hasValidPerplexityApiKey();
        break;
    }

    // Если Perplexity выбран, но не настроен на сервере - используем прямой вызов
    const forceDirectCall = provider === 'perplexity';
    
    // Если используем Supabase и оно подключено (кроме Perplexity, который не настроен на сервере)
    if (useSupabaseConnected && !forceDirectCall) {
      console.log('Использование Supabase бэкенда для получения предложений брендов');
      try {
        // Вызов AI через Supabase Edge Function с таймаутом
        console.log('Вызов AI через Supabase Edge Function:', provider);
        
        toast.loading('Получение рекомендаций AI...', {
          id: 'ai-suggestion-loading',
          duration: 15000
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
          // Если нет результатов, пробуем прямой вызов если есть API ключ
          if (hasApiKey) {
            console.log('Пробуем прямой вызов API...');
            return await directApiCall(provider, description, timeoutPromise);
          }
          return [];
        }
        
        // Кэшируем полученные предложения
        cacheSuggestions(description, result);
        
        return result;
      } catch (error) {
        toast.dismiss('ai-suggestion-loading');
        console.error('Ошибка при использовании Supabase для предложений брендов:', error);
        
        // При ошибке Supabase пробуем прямой вызов, если есть API ключ
        if (hasApiKey) {
          console.log('Пробуем прямой вызов API после ошибки Supabase...');
          toast.info('Переключение на прямой вызов API...', { duration: 3000 });
          return await directApiCall(provider, description, timeoutPromise);
        }
        
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                   { duration: 3000 });
        return [];
      }
    } else {
      // Прямой вызов API (для Perplexity или если Supabase не используется)
      if (!hasApiKey) {
        if (provider === 'perplexity') {
          toast.error("API ключ Perplexity не настроен. Пожалуйста, добавьте ключ в настройках.", { duration: 5000 });
        } else {
          toast.error(`API ключ ${provider} не настроен. Проверьте настройки.`, { duration: 5000 });
        }
        return [];
      }
      
      return await directApiCall(provider, description, timeoutPromise);
    }
  } catch (error) {
    console.error(`Ошибка при получении предложений брендов через ${provider}:`, error);
    toast.dismiss('ai-suggestion-loading');
    return []; // Возвращаем пустой массив при ошибке
  }
};

// Вспомогательная функция для прямого вызова API
const directApiCall = async (
  provider: AIProvider, 
  description: string, 
  timeoutPromise: Promise<BrandSuggestion[]>
): Promise<BrandSuggestion[]> => {
  toast.loading('Получение рекомендаций AI...', {
    id: 'ai-suggestion-loading',
    duration: 15000
  });
  
  try {
    console.log(`Прямой вызов API ${provider} для получения брендов...`);
    
    let result: BrandSuggestion[] = [];
    
    // Выбор соответствующего API в зависимости от провайдера
    switch (provider) {
      case 'openai':
        result = await Promise.race([
          fetchBrandSuggestionsFromOpenAI(description),
          timeoutPromise
        ]);
        break;
      case 'abacus':
        result = await Promise.race([
          fetchBrandSuggestionsFromAbacus(description),
          timeoutPromise
        ]);
        break;
      case 'perplexity':
        result = await Promise.race([
          fetchBrandSuggestionsFromPerplexity(description),
          timeoutPromise
        ]);
        break;
    }
    
    toast.dismiss('ai-suggestion-loading');
    
    if (result && result.length > 0) {
      // Кэшируем полученные результаты
      cacheSuggestions(description, result);
      return result;
    }
    
    console.warn(`Пустой результат от прямого вызова API ${provider}`);
    return [];
  } catch (error) {
    console.error(`Ошибка при прямом вызове API ${provider}:`, error);
    toast.dismiss('ai-suggestion-loading');
    toast.error(`Ошибка API ${provider}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, { duration: 3000 });
    return [];
  }
};
