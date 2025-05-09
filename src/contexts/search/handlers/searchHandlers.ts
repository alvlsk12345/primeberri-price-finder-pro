
import { useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";
import { SortOption } from "@/components/sorting/SortingMenu";

/**
 * Main search function handler
 */
export const useSearchHandler = (
  searchQuery: string,
  lastSearchQuery: string,
  filters: ProductFilters,
  sortOption: SortOption,
  cachedResults: {[page: number]: Product[]},
  currentPage: number,
  setSelectedProduct: (product: Product | null) => void,
  setSearchResults: (results: Product[]) => void,
  setCurrentPage: (page: number) => void,
  setTotalPages: (pages: number) => void,
  setCachedResults: React.Dispatch<React.SetStateAction<{[page: number]: Product[]}>>,
  setLastSearchQuery: (query: string) => void,
  setOriginalQuery: (query: string) => void,
  setHasSearched: (hasSearched: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setApiErrorMode: (errorMode: boolean) => void,
  applySorting: (products: Product[], sort: SortOption) => Product[]
) => {
  // Memoized search function
  return useCallback(async (page: number = 1, forceNewSearch: boolean = false) => {
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
        const results = applySorting([...cachedResults[page]], sortOption);
        
        setSearchResults(results);
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
        // Apply sorting before setting results
        const sortedProducts = applySorting([...results.products], sortOption);
        
        setSearchResults(sortedProducts);
        setCachedResults(prev => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
      } else {
        // Check if we have results in cache for current search query
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          const sortedCachedProducts = applySorting([...cachedResults[1]], sortOption);
          setSearchResults(sortedCachedProducts);
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
        const sortedCachedProducts = applySorting([...cachedResults[currentPage]], sortOption);
        setSearchResults(sortedCachedProducts);
      } else if (cachedResults[1] && cachedResults[1].length > 0) {
        // If no results for current page, return to first page
        const sortedFirstPageProducts = applySorting([...cachedResults[1]], sortOption);
        setSearchResults(sortedFirstPageProducts);
        setCurrentPage(1);
        toast.info('Returning to first page due to error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, lastSearchQuery, filters, sortOption, cachedResults, currentPage, setSearchResults, setCurrentPage, 
      setTotalPages, setCachedResults, setOriginalQuery, setLastSearchQuery, setHasSearched, 
      setIsLoading, setApiErrorMode, applySorting]);
};
