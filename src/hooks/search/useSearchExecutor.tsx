
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
    
    try {
      // Устанавливаем текущую страницу перед выполнением запроса
      console.log(`Устанавливаем текущую страницу: ${page}`);
      setCurrentPage(page);
      
      // Переводим запрос на английский, если он на русском
      const { translatedQuery, wasTranslated } = await translateQueryIfNeeded(queryToUse);
      const searchText = translatedQuery;
      
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
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters,
        requireGermanResults: true, // Add flag to ensure German results
        minResultCount: 12, // Увеличено минимальное количество результатов
      };
      
      // Execute the search
      const results = await executeApiCall(searchParams);
      console.log(`Search completed for page ${page}, got ${results.products.length} results`);
      
      // Apply sorting and filtering to results if needed
      let sortedProducts = applyFiltersAndSorting(results.products, filters);
      
      // Save found products to state and cache
      if (sortedProducts.length > 0) {
        console.log(`После применения фильтров и сортировки осталось ${sortedProducts.length} товаров`);
        setSearchResults(sortedProducts);
        lastSuccessfulResultsRef.current = sortedProducts; // Сохраняем успешные результаты
        
        // Create a new object instead of using a function
        const newCache = { ...cachedResults };
        newCache[page] = sortedProducts;
        setCachedResults(newCache);
        setTotalPages(results.totalPages);
        
        console.log(`Найдено ${sortedProducts.length} товаров!`);
        
        return { success: true, products: sortedProducts };
      } 
      
      if (lastSuccessfulResultsRef.current.length > 0) {
        // Если текущий запрос не вернул результатов, но у нас есть предыдущие результаты
        console.log('По запросу ничего не найдено, возвращаем предыдущие результаты');
        toast.info('По вашему запросу ничего не найдено. Показываем предыдущие результаты.', { duration: 3000 });
        setSearchResults(lastSuccessfulResultsRef.current);
        return { success: true, products: lastSuccessfulResultsRef.current };
      }
      
      setSearchResults([]);
      console.log('По вашему запросу ничего не найдено.');
      toast.error('По вашему запросу ничего не найдено. Попробуйте изменить запрос.', { duration: 4000 });
      return { success: false, products: [] };
    } catch (error) {
      return handleSearchError(error);
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
