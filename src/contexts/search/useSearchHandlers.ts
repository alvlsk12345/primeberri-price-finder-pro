
import { useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

export const useSearchHandlers = (
  searchQuery: string,
  lastSearchQuery: string,
  filters: ProductFilters,
  cachedResults: {[page: number]: Product[]},
  currentPage: number,
  setSelectedProduct: (product: Product | null) => void,
  setSearchResults: (results: Product[] | ((prevResults: Product[]) => Product[])) => void,
  setCurrentPage: (page: number) => void,
  setTotalPages: (pages: number) => void,
  setCachedResults: React.Dispatch<React.SetStateAction<{[page: number]: Product[]}>>,
  setLastSearchQuery: (query: string) => void,
  setOriginalQuery: (query: string) => void,
  setHasSearched: (hasSearched: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setApiErrorMode: (errorMode: boolean) => void,
  setPageChangeCount: React.Dispatch<React.SetStateAction<number>>
) => {
  // Product selection handler - memoized
  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, [setSelectedProduct]);
  
  // Memoized search function
  const handleSearch = useCallback(async (page: number = 1, forceNewSearch: boolean = false) => {
    // Check if there's a query for search
    if (!searchQuery && !lastSearchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Use current search query or last successful one
    const queryToUse = searchQuery || lastSearchQuery;
    
    setIsLoading(true);
    setApiErrorMode(false); // Reset API error state before new request
    
    try {
      // If it's the same page for the same query and we have cached results
      const isSameQuery = queryToUse === lastSearchQuery;
      if (!forceNewSearch && isSameQuery && cachedResults[page]) {
        console.log(`Using cached results for page ${page}`);
        setSearchResults(cachedResults[page]);
        setCurrentPage(page);
        setIsLoading(false);
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
      
      // Define countries for search - either from filters or all
      const searchCountries = filters.countries && filters.countries.length > 0 
        ? filters.countries
        : EUROPEAN_COUNTRIES.map(country => country.code);
      
      // Use query directly - no translation needed
      const results = await searchProducts({
        query: queryToUse,
        page: page,
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters
      });
      
      // Check if mock data was used due to API error
      if (results.fromMock) {
        setApiErrorMode(true);
        console.log('Using mock data due to API error');
      }
      
      // Save found products to state and cache
      if (results.products.length > 0) {
        setSearchResults(results.products);
        setCachedResults(prev => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
      } else {
        // Check if we have results in cache for current search query
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          setSearchResults(cachedResults[1]);
          setCurrentPage(1);
          toast.info('Error loading page, showing first page results');
        } else {
          setSearchResults([]);
          toast.info('No results found for your query.');
        }
      }
      
      // Mark that search has been performed
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('An error occurred while searching for products');
      
      // Set API error mode
      setApiErrorMode(true);
      
      // If error occurs, check if we have cached results
      if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
        // If error occurred when changing pages, use current cached results
        setSearchResults(cachedResults[currentPage]);
      } else if (cachedResults[1] && cachedResults[1].length > 0) {
        // If no results for current page, return to first page
        setSearchResults(cachedResults[1]);
        setCurrentPage(1);
        toast.info('Returning to first page due to error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, lastSearchQuery, filters, cachedResults, currentPage, setSearchResults, setCurrentPage, 
      setTotalPages, setCachedResults, setOriginalQuery, setLastSearchQuery, setHasSearched, 
      setIsLoading, setApiErrorMode]);
  
  // Page change handler - memoized
  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && page >= 1) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      // Increment page change counter to force a re-render
      setPageChangeCount(prev => prev + 1);
      // Set current page first
      setCurrentPage(page);
      // Then trigger a search with new page
      handleSearch(page);
    }
  }, [currentPage, handleSearch, setCurrentPage, setPageChangeCount]);
  
  // Filter change handler - memoized
  const handleFilterChange = useCallback((newFilters: ProductFilters) => {
    setCurrentPage(1); // Reset to first page when filters change
    handleSearch(1, true);
  }, [handleSearch, setCurrentPage]);

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange
  };
};
