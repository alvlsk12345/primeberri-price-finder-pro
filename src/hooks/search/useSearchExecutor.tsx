
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";

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
  // Timeout reference to ensure we can cancel pending timeouts
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
      // Set current page before executing request
      setCurrentPage(page);
      
      // Get search countries - ensure we have German results
      const searchCountries = getSearchCountries();
      // Make sure Germany ('de') is included in search countries
      if (!searchCountries.includes('de')) {
        searchCountries.push('de');
      }
      
      // Create search params
      const searchParams: SearchParams = {
        query: queryToUse,
        page: page,
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters,
        requireGermanResults: true, // Add flag to ensure German results
        minResultCount: 10 // Ensure minimum 10 results
      };
      
      // Execute the search
      const results = await searchProducts(searchParams);
      console.log(`Search completed for page ${page}, got ${results.products.length} results`);
      
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
        // Create a new object instead of using a function
        const newCache = { ...cachedResults };
        newCache[page] = results.products;
        setCachedResults(newCache);
        setTotalPages(results.totalPages);
        
        if (!results.isDemo) {
          toast.success(`Найдено ${results.products.length} товаров!`);
        }
        
        return { success: true, products: results.products };
      } 
      
      setSearchResults([]);
      toast.info('По вашему запросу ничего не найдено.');
      return { success: false, products: [] };
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      return { success: false, error };
    } finally {
      clearTimeout(searchTimeout);
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  // Cleanup function
  const cleanupSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  return {
    executeSearch,
    cleanupSearch
  };
}
