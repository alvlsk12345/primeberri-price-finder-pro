
import { useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { SearchContextType } from './types';
import { SortOption } from "@/components/sorting/SortingMenu";
import { searchProductsViaZylalabs } from "@/services/api/zylalabsService";

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
  setCachedResults: (results: {[page: number]: Product[]}) => void,
  setLastSearchQuery: (query: string) => void,
  setOriginalQuery: (query: string) => void,
  setHasSearched: (hasSearched: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setApiErrorMode: (isError: boolean) => void,
  setPageChangeCount: (count: number) => void,
  setFilters: (filters: ProductFilters) => void,
  setSortOption: (option: SortOption) => void
) => {
  // Handle search with pagination and caching
  const handleSearch = useCallback(async (page: number = 1, forceNewSearch: boolean = false) => {
    setIsLoading(true);
    setApiErrorMode(false);

    if (forceNewSearch) {
      setCurrentPage(1);
      page = 1;
    }

    try {
      const searchParams = {
        query: searchQuery,
        page: page,
        countries: ['gb'],
        language: 'en',
        filters: filters,
        sort: sortOption
      };

      const results = await searchProductsViaZylalabs(searchParams);

      if (results && results.products) {
        setSearchResults(results.products);
        setTotalPages(results.totalPages || 1);
        setCurrentPage(page);
      } else {
        setSearchResults([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setApiErrorMode(true);
      setSearchResults([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, sortOption, setIsLoading, setApiErrorMode, setSearchResults, setTotalPages, setCurrentPage]);

  const handleProductSelect = useCallback((product: Product) => {
    console.log('Selected product:', product);
    setSelectedProduct(product);
  }, [setSelectedProduct]);

  const handlePageChange = useCallback((newPage: number) => {
    console.log(`handlePageChange - Requesting page: ${newPage}`);
    handleSearch(newPage);
  }, [handleSearch]);

  const handleFilterChange = useCallback((newFilters: ProductFilters) => {
    console.log(`Filter change - New filters:`, newFilters);
    setFilters(newFilters);
  }, [setFilters]);

  const handleSortChange = useCallback((option: SortOption) => {
    // Update the sort option in state
    setSortOption(option);
    
    // Sort the results based on the selected option
    console.log(`Sort change - New sort option: ${option}`);
  }, [setSortOption]);

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange
  };
};
