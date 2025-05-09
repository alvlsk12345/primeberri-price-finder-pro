import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

// Define the search context type
type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchResults: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currentPage: number;
  totalPages: number;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  originalQuery: string;
  lastSearchQuery: string;
  hasSearched: boolean;
  isUsingDemoData: boolean;
  handleSearch: (page?: number, forceNewSearch?: boolean) => Promise<void>;
  handleProductSelect: (product: Product) => void;
  handlePageChange: (page: number) => void;
  handleFilterChange: (newFilters: ProductFilters) => void;
};

// Create context with default values
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cachedResults, setCachedResults] = useState<{[page: number]: Product[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [originalQuery, setOriginalQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [pageChangeCount, setPageChangeCount] = useState(0);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

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
    setIsUsingDemoData(false);
    
    try {
      // If it's the same page for the same query and we have cached results
      const isSameQuery = queryToUse === lastSearchQuery;
      if (!forceNewSearch && isSameQuery && cachedResults[page]) {
        console.log(`Используем кэшированные результаты для страницы ${page}`);
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
      
      // Определяем страны для поиска - либо из фильтров, либо все
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
      
      // Check if we're using demo data
      if (results.isDemo) {
        setIsUsingDemoData(true);
      }
      
      // Save found products to state and cache
      if (results.products.length > 0) {
        setSearchResults(results.products);
        setCachedResults(prev => ({...prev, [page]: results.products}));
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
      setIsLoading(false);
    }
  }, [searchQuery, lastSearchQuery, filters, cachedResults, currentPage]);

  // Product selection handler
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Page change handler
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      // Increment page change counter to force a re-render
      setPageChangeCount(prev => prev + 1);
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

  // Effect для отладки изменения страницы
  useEffect(() => {
    console.log(`Page change effect triggered: current page is ${currentPage}, change count: ${pageChangeCount}`);
  }, [currentPage, pageChangeCount]);

  const value = {
    searchQuery,
    setSearchQuery,
    isLoading,
    searchResults,
    selectedProduct,
    setSelectedProduct,
    currentPage,
    totalPages,
    filters,
    setFilters,
    originalQuery,
    lastSearchQuery,
    hasSearched,
    isUsingDemoData,
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

// Custom hook for using the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
