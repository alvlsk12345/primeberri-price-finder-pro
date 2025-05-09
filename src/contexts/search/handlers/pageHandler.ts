
import { useCallback } from 'react';

/**
 * Handler for page changes
 */
export const usePageChangeHandler = (
  currentPage: number,
  handleSearch: (page: number) => void,
  setCurrentPage: (page: number) => void,
  setPageChangeCount: React.Dispatch<React.SetStateAction<number>>
) => {
  return useCallback((page: number) => {
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
};
