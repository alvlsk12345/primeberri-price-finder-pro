
import { useCallback } from 'react';
import { ProductFilters } from "@/services/types";

/**
 * Handler for filter changes
 */
export const useFilterChangeHandler = (
  handleSearch: (page: number, forceNewSearch: boolean) => void,
  setCurrentPage: (page: number) => void,
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>
) => {
  return useCallback((newFilters: ProductFilters) => {
    console.log("Applying filters:", newFilters);
    // Update filters first, then trigger search
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    handleSearch(1, true);
  }, [handleSearch, setCurrentPage, setFilters]);
};
