
import React, { createContext, useState, useCallback, useContext } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { autoTranslateQuery } from "@/services/translationService";
import { toast } from "@/components/ui/sonner";

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
      
      // Translate query to English if it's in Russian
      let translatedQuery;
      try {
        translatedQuery = await autoTranslateQuery(queryToUse);
        console.log(`Запрос: "${queryToUse}" ${translatedQuery !== queryToUse ? `был переведен на: "${translatedQuery}"` : 'не требует перевода'}`);
      } catch (translateError) {
        console.error('Ошибка при переводе запроса:', translateError);
        translatedQuery = queryToUse; // Use original query if translation fails
        toast.error('Произошла ошибка при переводе запроса, используем исходный текст');
      }
      
      // Use translated query for search
      const results = await searchProducts({
        query: translatedQuery,
        page: page,
        filters: filters
      });
      
      // Save found products to state and cache
      if (results.products.length > 0) {
        setSearchResults(results.products);
        setCachedResults(prev => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
        toast.success(`Найдено ${results.products.length} товаров!`);
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
      handleSearch(page);
    }
  };
  
  // Filter change handler
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    handleSearch(1, true);
  };

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
