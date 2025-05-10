
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { toast } from "sonner";
import { useSearchApiCall } from './useSearchApiCall';
import { useSearchErrorHandler } from './useSearchErrorHandler';
import { useSearchQueryTranslator } from './useSearchQueryTranslator';
import { useSearchFilterProcessor } from './useSearchFilterProcessor';

type SearchExecutorProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasSearched: (searched: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
};

export function useSearchExecutor({
  isLoading,
  setIsLoading,
  setSearchResults,
  cachedResults,
  setCachedResults,
  setCurrentPage,
  setTotalPages,
  setHasSearched,
  setIsUsingDemoData,
  setApiInfo,
}: SearchExecutorProps) {
  // Сохраняем предыдущие результаты для восстановления при ошибке
  const lastSuccessfulResultsRef = useRef<Product[]>([]);
  
  // Используем новые хуки
  const { executeApiCall, cleanupApiCall } = useSearchApiCall({
    setIsLoading,
    setIsUsingDemoData, 
    setApiInfo
  });
  
  const { handleSearchError, showErrorMessage } = useSearchErrorHandler({
    lastSuccessfulResults: lastSuccessfulResultsRef,
    setSearchResults
  });
  
  const { translateQueryIfNeeded } = useSearchQueryTranslator();
  const { applyFiltersAndSorting } = useSearchFilterProcessor();
  
  // Счетчик попыток повторных запросов
  const retryAttemptsRef = useRef<number>(0);
  const MAX_RETRY_ATTEMPTS = 2;
  
  // Execute search with given parameters
  const executeSearch = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[]
  ) => {
    console.log(`executeSearch called with page: ${page}, query: ${queryToUse}`);
    setIsLoading(true);
    setIsUsingDemoData(false); // Изначально предполагаем, что используем API
    
    try {
      // Устанавливаем текущую страницу перед выполнением запроса
      console.log(`Устанавливаем текущую страницу: ${page}`);
      setCurrentPage(page);
      
      // ОТКЛЮЧЕНО: Переводим запрос на английский, если он на русском
      // const { translatedQuery, wasTranslated } = await translateQueryIfNeeded(queryToUse);
      // const searchText = translatedQuery;
      
      // Используем оригинальный запрос без перевода
      const searchText = queryToUse;
      console.log(`Используется запрос без перевода: "${searchText}"`);
      
      // Get search countries - ensure we have German results
      const searchCountries = getSearchCountries();
      // Make sure Germany ('de') is included in search countries
      if (!searchCountries.includes('de')) {
        searchCountries.push('de');
      }
      
      // Create search params
      const searchParams: SearchParams = {
        query: searchText,
        originalQuery: queryToUse, // Сохраняем оригинальный запрос
        page: page,
        language: 'en', // Теперь язык передается в API
        countries: searchCountries,
        filters: filters,
        requireGermanResults: true, // Add flag to ensure German results
        minResultCount: 12, // Увеличено минимальное количество результатов
      };
      
      // Включаем дополнительные логи для отладки
      console.log('Параметры поиска:', searchParams);
      
      try {
        // Execute the search
        const results = await executeApiCall(searchParams);
        console.log(`Search completed for page ${page}, got ${results.products?.length || 0} results`);
        
        // Дополнительный лог для отладки данных API
        if (results.products && results.products.length > 0) {
          console.log('Пример первого продукта:', results.products[0]);
        }
        
        // Сбрасываем счетчик попыток при успешном запросе
        retryAttemptsRef.current = 0;
        
        // Apply sorting and filtering to results if needed
        let sortedProducts = applyFiltersAndSorting(results.products || [], filters);
        
        // Save found products to state and cache
        if (sortedProducts.length > 0) {
          console.log(`После применения фильтров и сортировки осталось ${sortedProducts.length} товаров`);
          setSearchResults(sortedProducts);
          lastSuccessfulResultsRef.current = sortedProducts; // Сохраняем успешные результаты
          
          // Create a new object instead of using a function
          const newCache = { ...cachedResults };
          newCache[page] = sortedProducts;
          setCachedResults(newCache);
          setTotalPages(results.totalPages || 1);
          
          console.log(`Найдено ${sortedProducts.length} товаров!`);
          
          return { success: true, products: sortedProducts };
        } 
        
        // Если API не вернул результатов, сообщаем пользователю
        setSearchResults([]);
        console.log('По вашему запросу ничего не найдено.');
        toast.error('По вашему запросу ничего не найдено. Попробуйте изменить запрос.', { duration: 4000 });
        return { success: false, products: [] };
      } catch (apiError: any) {
        // Если произошла ошибка при вызове API
        console.error('Ошибка при запросе к API:', apiError);
        toast.error(`Ошибка API: ${apiError.message}`, { duration: 5000 });
        
        // Если у нас есть предыдущие результаты и код специально не требует их сброса,
        // возвращаем их для лучшего пользовательского опыта
        if (lastSuccessfulResultsRef.current.length > 0) {
          toast.info('Показаны предыдущие результаты из-за ошибки API', { duration: 3000 });
          setSearchResults(lastSuccessfulResultsRef.current);
          return { success: false, products: lastSuccessfulResultsRef.current };
        }
        
        setSearchResults([]);
        return { success: false, products: [] };
      }
    } catch (error) {
      // Попытка повторить запрос при ошибке сети или таймауте
      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        console.log(`Ошибка при поиске. Попытка повтора ${retryAttemptsRef.current} из ${MAX_RETRY_ATTEMPTS}`);
        toast.info(`Повтор запроса (попытка ${retryAttemptsRef.current})...`, { duration: 2000 });
        
        // Задержка перед повторной попыткой (3 секунды)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          // Рекурсивный вызов для повторной попытки
          return await executeSearch(queryToUse, page, lastSearchQuery, filters, getSearchCountries);
        } catch (retryError) {
          // Если и повторная попытка не удалась, обрабатываем как обычную ошибку
          console.error('Повторная попытка не удалась:', retryError);
          return handleSearchError(retryError);
        }
      } else {
        // Исчерпаны все попытки повтора
        retryAttemptsRef.current = 0;
        return handleSearchError(error);
      }
    } finally {
      cleanupApiCall();
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  // Cleanup function
  const cleanupSearch = () => {
    cleanupApiCall();
  };

  return {
    executeSearch,
    cleanupSearch
  };
}
