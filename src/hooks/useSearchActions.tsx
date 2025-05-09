
import { useRef } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchExecutor } from './search/useSearchExecutor';
import { useSearchCache } from './search/useSearchCache';

// Types for state management props
type SearchStateProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number; 
  setTotalPages: (pages: number) => void;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  originalQuery: string;
  setOriginalQuery: (query: string) => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  isUsingDemoData: boolean;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  apiInfo: Record<string, string> | undefined;
  setApiInfo: (info: Record<string, string> | undefined) => void;
  getSearchCountries: () => string[];
};

export function useSearchActions(props: SearchStateProps) {
  const {
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    searchResults,
    setSearchResults,
    cachedResults,
    setCachedResults,
    selectedProduct,
    setSelectedProduct,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    pageChangeCount,
    setPageChangeCount,
    filters,
    setFilters,
    originalQuery,
    setOriginalQuery,
    lastSearchQuery,
    setLastSearchQuery,
    hasSearched,
    setHasSearched,
    isUsingDemoData,
    setIsUsingDemoData,
    apiInfo,
    setApiInfo,
    getSearchCountries
  } = props;

  // Use our new refactored hooks
  const { executeSearch, cleanupSearch } = useSearchExecutor({
    isLoading,
    setIsLoading,
    setSearchResults,
    cachedResults,
    setCachedResults,
    setCurrentPage,
    setTotalPages,
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo
  });
  
  const { getCachedResults, handleSearchFailure } = useSearchCache({
    cachedResults,
    setSearchResults,
    setCurrentPage
  });

  // Main search function
  const handleSearch = async (page: number = 1, forceNewSearch: boolean = false) => {
    console.log(`handleSearch called with page: ${page}, forceNewSearch: ${forceNewSearch}`);
    
    // Check if there's a query for search
    if (!searchQuery && !lastSearchQuery) {
      console.log('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Use current search query or last successful one
    const queryToUse = searchQuery || lastSearchQuery;
    
    // Важно: всегда устанавливаем текущую страницу перед проверкой кеша
    setCurrentPage(page);
    
    // If it's the same page for the same query and we have cached results
    const cachedResultsForQuery = getCachedResults(queryToUse, lastSearchQuery, page);
    if (!forceNewSearch && cachedResultsForQuery) {
      console.log(`Используем кэшированные результаты для страницы ${page}`);
      setSearchResults(cachedResultsForQuery);
      return;
    }
    
    // Save original query (for display to user)
    setOriginalQuery(queryToUse);
    
    // If this is a new search query, reset cache
    const isSameQuery = queryToUse === lastSearchQuery;
    if (!isSameQuery || forceNewSearch) {
      console.log(`Новый запрос или принудительный поиск. Очищаем кэш.`);
      setLastSearchQuery(queryToUse);
      // Reset results cache for new query
      setCachedResults({});
    }
    
    try {
      // Execute search
      console.log(`Выполняем поиск для запроса "${queryToUse}", страница: ${page}`);
      const result = await executeSearch(
        queryToUse,
        page,
        lastSearchQuery,
        filters,
        getSearchCountries
      );
      
      // If search was unsuccessful, try to use cached results
      if (!result.success) {
        // Check if we have results in cache for current search query
        console.log(`Поиск не удался. Проверяем кэш.`);
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          setSearchResults(cachedResults[1]);
          setCurrentPage(1);
          console.log('Ошибка при загрузке страницы, показаны результаты первой страницы');
        }
      }
    } catch (error) {
      console.error(`Ошибка при выполнении поиска:`, error);
      handleSearchFailure(currentPage);
    }
  };

  // Product selection handler
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Page change handler
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      // Increment the counter
      setPageChangeCount(pageChangeCount + 1);
      // Важное исправление: перед выполнением поиска устанавливаем текущую страницу
      // Trigger a search with new page
      handleSearch(page);
    }
  };
  
  // Модифицированный Filter change handler - применяет фильтры сразу
  const handleFilterChange = (newFilters: ProductFilters) => {
    // Устанавливаем новые фильтры
    setFilters(newFilters);
    
    // Сразу выполняем поиск с новыми фильтрами
    console.log("Автоматически применяем фильтры после изменения");
    // Reset to first page when filters change and force new search
    handleSearch(1, true);
  };

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    cleanupSearch
  };
}
