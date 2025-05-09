
import { useRef } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";

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

export function useSearchActions({
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
}: SearchStateProps) {
  // Timeout reference to ensure we can cancel pending timeouts
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Main search function
  const handleSearch = async (page: number = 1, forceNewSearch: boolean = false) => {
    // Check if there's a query for search
    if (!searchQuery && !lastSearchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Cancel any pending searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Use current search query or last successful one
    const queryToUse = searchQuery || lastSearchQuery;
    
    setIsLoading(true);
    setIsUsingDemoData(false);
    
    // Set a timeout to ensure search doesn't hang for too long
    const searchTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast.error('Поиск занял слишком много времени. Попробуйте снова.');
      }
    }, 10000); // 10 seconds timeout
    
    searchTimeoutRef.current = searchTimeout;
    
    try {
      // If it's the same page for the same query and we have cached results
      const isSameQuery = queryToUse === lastSearchQuery;
      if (!forceNewSearch && isSameQuery && cachedResults[page]) {
        console.log(`Используем кэшированные результаты для страницы ${page}`);
        setSearchResults(cachedResults[page]);
        setCurrentPage(page);
        setIsLoading(false);
        clearTimeout(searchTimeout);
        return;
      }
      
      // Save original query (for display to user)
      setOriginalQuery(queryToUse);
      
      // If this is a new search query, save it
      if (!isSameQuery || forceNewSearch) {
        setLastSearchQuery(queryToUse);
        // Reset results cache for new query
        setCachedResults({});
      }
      
      // Set current page before executing request
      setCurrentPage(page);
      
      // Get search countries
      const searchCountries = getSearchCountries();
      
      // Use query directly - no translation needed
      const results = await searchProducts({
        query: queryToUse,
        page: page,
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters
      });
      
      // Check if we're using demo data and update state
      if (results.isDemo) {
        setIsUsingDemoData(true);
        // Reset API info when using demo data
        setApiInfo(undefined);
      } else if (results.apiInfo) {
        // Update API info if available
        setApiInfo(results.apiInfo);
      }
      
      // Save found products to state and cache
      if (results.products.length > 0) {
        setSearchResults(results.products);
        // Fix: Use correct type for setCachedResults
        setCachedResults((prev) => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
        
        if (!results.isDemo) {
          toast.success(`Найдено ${results.products.length} товаров!`);
        }
      } else {
        // Check if we have results in cache for current search query
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          setSearchResults(cachedResults[1]);
          setCurrentPage(1);
          toast.info('Ошибка при загрузке страницы, показаны результаты первой страницы');
        } else {
          setSearchResults([]);
          toast.info('По вашему запросу ничего не найдено.');
        }
      }
      
      // Mark that search has been performed
      setHasSearched(true);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      
      // If error occurs, check if we have cached results
      if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
        // If error occurred when changing pages, use current cached results
        setSearchResults(cachedResults[currentPage]);
      } else if (cachedResults[1] && cachedResults[1].length > 0) {
        // If no results for current page, return to first page
        setSearchResults(cachedResults[1]);
        setCurrentPage(1);
        toast.info('Возврат к первой странице из-за ошибки');
      }
    } finally {
      clearTimeout(searchTimeout);
      setIsLoading(false);
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
      // Fix: Use correct type for setPageChangeCount
      setPageChangeCount((prev) => prev + 1);
      // Set current page first
      setCurrentPage(page);
      // Then trigger a search with new page
      handleSearch(page);
    }
  };
  
  // Filter change handler
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    handleSearch(1, true);
  };

  // Cleanup function for component unmounting
  const cleanupSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    cleanupSearch
  };
}
