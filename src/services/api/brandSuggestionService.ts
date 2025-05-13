
import { BrandSuggestion } from '../types';
import { fetchBrandSuggestions as fetchOpenAIBrandSuggestions } from './openai/brandSuggestion';
import { fetchBrandSuggestions as fetchAbacusBrandSuggestions } from './abacus/brandSuggestion';
import { fetchBrandSuggestions as fetchPerplexityBrandSuggestions } from './perplexity/brandSuggestion';
import { getSelectedAIProvider } from './aiProviderService';
import { 
  isUsingSupabaseBackend, 
  isFallbackEnabled 
} from './supabase/config';
import { 
  fetchBrandSuggestionsViaOpenAI, 
  fetchBrandSuggestionsViaPerplexity
} from './supabase/aiService';
import { isSupabaseConnected } from './supabase/client';

/**
 * Получает предложения брендов на основе описания товара
 * @param description Описание товара
 * @returns Список предложений брендов или null в случае ошибки
 */
export const getBrandSuggestions = async (description: string): Promise<BrandSuggestion[] | null> => {
  try {
    const provider = getSelectedAIProvider();
    
    console.log(`Получение предложений брендов через провайдер: ${provider}`);
    
    // Проверяем, используется ли Supabase Backend
    const useSupabase = isUsingSupabaseBackend();
    const supabaseConnected = await isSupabaseConnected();
    const fallbackEnabled = isFallbackEnabled();
    
    // Логика выбора варианта вызова
    if (useSupabase && supabaseConnected) {
      console.log('Используем Supabase Backend для вызова AI');
      
      try {
        if (provider === 'openai') {
          return await fetchBrandSuggestionsViaOpenAI(description);
        } else if (provider === 'perplexity') {
          return await fetchBrandSuggestionsViaPerplexity(description);
        } else {
          // Абакус через supabase не поддерживает fetching бренд саггестов
          // Используем прямой вызов
          return await fetchAbacusBrandSuggestions(description);
        }
      } catch (error) {
        console.error('Ошибка при вызове через Supabase:', error);
        
        // Если включен фоллбэк и ошибка - пробуем прямой вызов
        if (fallbackEnabled) {
          console.log('Используем фоллбэк на прямой вызов API');
          return await directProviderCall(provider, description);
        }
        throw error;
      }
    } else {
      // Прямой вызов API без Supabase
      console.log('Используем прямой вызов API');
      return await directProviderCall(provider, description);
    }
  } catch (error) {
    console.error('Ошибка при получении предложений брендов:', error);
    return null;
  }
};

/**
 * Вспомогательная функция для прямого вызова API нужного провайдера
 */
const directProviderCall = async (provider: string, description: string): Promise<BrandSuggestion[]> => {
  if (provider === 'openai') {
    return await fetchOpenAIBrandSuggestions(description);
  } else if (provider === 'abacus') {
    return await fetchAbacusBrandSuggestions(description);
  } else if (provider === 'perplexity') {
    return await fetchPerplexityBrandSuggestions(description);
  } else {
    throw new Error(`Неподдерживаемый провайдер AI: ${provider}`);
  }
};
