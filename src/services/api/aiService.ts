
import { BrandSuggestion, Product, SearchParams } from "@/services/types";
import { fetchBrandSuggestions as fetchBrandSuggestionsOpenAI } from "./openai";
import { fetchBrandSuggestions as fetchBrandSuggestionsAbacus } from "./abacus";
import { searchProductsViaZylalabs } from "./zylalabsService";
import { searchProductsViaAbacus } from "./abacus";
import { hasValidApiKey as hasValidOpenAIKey } from "./openai";
import { hasValidApiKey as hasValidAbacusKey } from "./abacus";

// Тип для провайдера AI
export type AIProvider = 'openai' | 'abacus';

// Функция для получения текущего провайдера из localStorage
export const getCurrentAIProvider = (): AIProvider => {
  const provider = localStorage.getItem('ai_provider') as AIProvider;
  return provider === 'abacus' ? 'abacus' : 'openai'; // По умолчанию используем OpenAI
};

// Функция для установки текущего провайдера
export const setCurrentAIProvider = (provider: AIProvider): void => {
  localStorage.setItem('ai_provider', provider);
};

/**
 * Функция для получения предложений брендов от текущего AI провайдера
 * @param description Описание продукта для поиска брендов
 * @returns Массив предложений брендов
 */
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  const provider = getCurrentAIProvider();
  
  try {
    // Выбираем функцию в зависимости от провайдера
    if (provider === 'abacus' && hasValidAbacusKey()) {
      return await fetchBrandSuggestionsAbacus(description);
    } else {
      return await fetchBrandSuggestionsOpenAI(description);
    }
  } catch (error) {
    console.error(`Ошибка при запросе к ${provider} для брендов:`, error);
    
    // Если произошла ошибка и мы использовали Abacus, попробуем с OpenAI
    if (provider === 'abacus' && hasValidOpenAIKey()) {
      console.log('Пробуем запасной вариант с OpenAI');
      return await fetchBrandSuggestionsOpenAI(description);
    }
    
    throw error;
  }
};

/**
 * Функция для поиска товаров с помощью выбранного AI провайдера
 * @param params Параметры поиска
 * @returns Результаты поиска
 */
export const searchProducts = async (params: SearchParams): Promise<{
  products: Product[];
  totalPages: number;
  apiInfo?: Record<string, string>;
  isDemo?: boolean;
}> => {
  const provider = getCurrentAIProvider();
  
  try {
    // Выбираем функцию в зависимости от провайдера
    if (provider === 'abacus' && hasValidAbacusKey()) {
      return await searchProductsViaAbacus(params);
    } else {
      return await searchProductsViaZylalabs(params);
    }
  } catch (error) {
    console.error(`Ошибка при поиске товаров через ${provider}:`, error);
    
    // Если произошла ошибка с Abacus, используем Zylalabs
    if (provider === 'abacus') {
      console.log('Пробуем запасной вариант с Zylalabs');
      return await searchProductsViaZylalabs(params);
    }
    
    throw error;
  }
};
