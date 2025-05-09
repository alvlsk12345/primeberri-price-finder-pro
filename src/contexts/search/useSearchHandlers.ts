
import { useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { SortOption } from "@/components/sorting/SortingMenu";
import { useSearchHandler } from './handlers/searchHandlers';
import { useProductSelectHandler } from './handlers/productHandler';
import { usePageChangeHandler } from './handlers/pageHandler';
import { useFilterChangeHandler } from './handlers/filterHandler';
import { useSortChangeHandler } from './handlers/sortHandler';
import { applySorting } from './utils/sortingUtils';

export const useSearchHandlers = (
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
  setPageChangeCount: React.Dispatch<React.SetStateAction<number>>,
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>,
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>
) => {
  // Get the main search handler
  const handleSearch = useSearchHandler(
    searchQuery,
    lastSearchQuery,
    filters,
    sortOption,
    cachedResults,
    currentPage,
    setSelectedProduct,
    setSearchResults,
    setCurrentPage,
    setTotalPages,
    setCachedResults,
    setLastSearchQuery,
    setOriginalQuery,
    setHasSearched,
    setIsLoading,
    setApiErrorMode,
    applySorting
  );
  
  // Product selection handler
  const handleProductSelect = useProductSelectHandler(setSelectedProduct);
  
  // Page change handler
  const handlePageChange = usePageChangeHandler(
    currentPage,
    handleSearch,
    setCurrentPage,
    setPageChangeCount
  );
  
  // Filter change handler
  const handleFilterChange = useFilterChangeHandler(
    handleSearch,
    setCurrentPage,
    setFilters
  );
  
  // Sort change handler - pass the current search results
  const handleSortChange = useSortChangeHandler(
    setSortOption,
    setSearchResults,
    // Pass the current results from the SearchProvider
    [],  // This will be updated in SearchProvider
    applySorting
  );

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange
  };
};
