import { useRef } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchExecutionActions } from './search/useSearchExecutionActions';
import { useProductSelectionActions } from './search/useProductSelectionActions';
import { usePaginationActions } from './search/usePaginationActions';
import { useFilterActions } from './search/useFilterActions';

// Типы для пропсов управления состоянием
type SearchStateProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  allSearchResults: Product[]; 
  setAllSearchResults: (results: Product[]) => void;
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
    allSearchResults,
    setAllSearchResults,
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

  // Используем наши хуки для различных действий, теперь с полным набором параметров
  const { handleSearch, cleanupSearch } = useSearchExecutionActions({
    searchQuery,
    lastSearchQuery,
    setLastSearchQuery,
    isLoading,
    setIsLoading,
    searchResults,
    setSearchResults,
    allSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    filters,
    setOriginalQuery,
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo,
    getSearchCountries
  });
  
  const { handleProductSelect } = useProductSelectionActions({
    setSelectedProduct
  });
  
  // Адаптируем интерфейс handleSearch для совместимости с требуемым API
  const adaptedHandleSearch = async (page: number, forceNewSearch?: boolean) => {
    return handleSearch({ 
      forcePage: page, 
      forceRefresh: forceNewSearch 
    });
  };
  
  // Адаптируем взаимодействие между новым форматом handleSearch и старым интерфейсом для пагинации
  const { handlePageChange } = usePaginationActions({
    currentPage,
    totalPages,
    pageChangeCount,
    setPageChangeCount,
    setCurrentPage,
    handlePageChange: (page: number) => handleSearch({ forcePage: page })
  });
  
  const { handleFilterChange } = useFilterActions({
    allResults: allSearchResults,
    setFilters,
    handleSearch: () => handleSearch({ forceRefresh: true }),
    filters,
    setSearchResults
  });

  return {
    handleSearch: adaptedHandleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    cleanupSearch
  };
}
