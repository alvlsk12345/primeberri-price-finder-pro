
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
  allSearchResults: Product[]; // Добавляем все результаты
  setAllSearchResults: (results: Product[]) => void; // Добавляем установку всех результатов
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
    allSearchResults,        // Добавляем все результаты
    setAllSearchResults,     // Добавляем установку всех результатов
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

  // Используем наши новые хуки для различных действий
  const { handleSearch, cleanupSearch } = useSearchExecutionActions({
    searchQuery,
    lastSearchQuery,
    setLastSearchQuery,
    isLoading,
    setIsLoading,
    searchResults,
    setSearchResults,
    allSearchResults,        // Добавляем
    setAllSearchResults,     // Добавляем
    cachedResults,
    setCachedResults,
    currentPage,
    setCurrentPage,
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
  
  // Для paginationActions нам нужна ссылка на handleSearch, поэтому создаем его после
  const { handlePageChange } = usePaginationActions({
    currentPage,
    totalPages,
    pageChangeCount,
    setPageChangeCount,
    handleSearch
  });
  
  // Для filterActions также нужна ссылка на handleSearch
  const { handleFilterChange } = useFilterActions({
    allResults: allSearchResults, // Используем allSearchResults вместо неизвестного свойства
    setFilters,
    handleSearch,
    filters,
    setSearchResults
  });

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    cleanupSearch
  };
}
