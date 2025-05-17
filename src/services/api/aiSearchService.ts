
import { toast } from "sonner";
import { getSelectedAIProvider, getProviderDisplayName } from "./aiProviderService";
import { fetchFromOpenAI } from "./openai/searchService";
import { searchProductsViaAbacus } from "./abacus";
import { Product, SearchParams } from "../types";

/**
 * Универсальная функция для поиска товаров через выбранный AI провайдер
 * @param query - поисковый запрос
 * @returns результат поиска в стандартизированном формате
 */
export const searchProductsViaSelectedAI = async (query: string): Promise<any> => {
  // Получаем текущий выбранный провайдер
  const selectedProvider = getSelectedAIProvider();
  const providerName = getProviderDisplayName(selectedProvider);
  
  console.log(`Выполнение поиска через провайдер: ${providerName}`);
  
  try {
    // Показываем уведомление о выбранном провайдере
    toast.info(`Поиск выполняется с использованием ${providerName}`, { duration: 2000 });
    
    // Создаем параметры поиска с обязательными полями
    const searchParams: SearchParams = {
      query: query,
      page: 1,
      language: 'en',
      countries: []
    };
    
    // В зависимости от выбранного провайдера вызываем соответствующую функцию
    if (selectedProvider === 'openai') {
      console.log('Использование OpenAI для поиска товаров');
      return await fetchFromOpenAI(searchParams);
    } else if (selectedProvider === 'perplexity') {
      console.log('Использование Perplexity для поиска товаров');
      return await searchProductsViaAbacus(searchParams);
    } else {
      // Если провайдер неизвестен, используем OpenAI по умолчанию
      console.warn(`Неизвестный провайдер AI: ${selectedProvider}, используем OpenAI по умолчанию`);
      return await fetchFromOpenAI(searchParams);
    }
  } catch (error) {
    console.error(`Ошибка при поиске через ${providerName}:`, error);
    toast.error(`Ошибка при поиске через ${providerName}. Проверьте настройки API ключа.`, { duration: 3000 });
    
    // Если основной провайдер не доступен, пробуем использовать другой
    if (selectedProvider === 'openai') {
      toast.info('Пробуем выполнить поиск через Perplexity...', { duration: 2000 });
      try {
        const fallbackParams: SearchParams = { 
          query: query,
          page: 1,
          language: 'en',
          countries: []
        };
        return await searchProductsViaAbacus(fallbackParams);
      } catch (fallbackError) {
        console.error('Ошибка при использовании запасного провайдера:', fallbackError);
        throw new Error('Не удалось выполнить поиск с помощью доступных AI провайдеров');
      }
    } else {
      toast.info('Пробуем выполнить поиск через OpenAI...', { duration: 2000 });
      try {
        const fallbackParams: SearchParams = { 
          query: query,
          page: 1,
          language: 'en',
          countries: []
        };
        return await fetchFromOpenAI(fallbackParams);
      } catch (fallbackError) {
        console.error('Ошибка при использовании запасного провайдера:', fallbackError);
        throw new Error('Не удалось выполнить поиск с помощью доступных AI провайдеров');
      }
    }
  }
};
