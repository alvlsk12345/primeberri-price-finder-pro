
import { useCallback } from 'react';
import { Product } from "@/services/types";
import { SortOption } from "@/components/sorting/SortingMenu";

/**
 * Handler for sort option changes
 */
export const useSortChangeHandler = (
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>,
  setSearchResults: (results: Product[]) => void,
  currentResults: Product[],
  applySorting: (products: Product[], sort: SortOption) => Product[]
) => {
  return useCallback((option: SortOption) => {
    console.log("Applying sort option:", option);
    setSortOption(option);
    
    // Apply sorting to the current results and update state
    const sortedResults = applySorting([...currentResults], option);
    setSearchResults(sortedResults);
  }, [setSortOption, setSearchResults, currentResults, applySorting]);
};
