
import { toast } from "sonner";
import { Product } from "@/services/types";

type SearchCacheProps = {
  cachedResults: {[page: number]: Product[]};
  setSearchResults: (results: Product[]) => void;
  setCurrentPage: (page: number) => void;
};

export function useSearchCache({
  cachedResults,
  setSearchResults,
  setCurrentPage
}: SearchCacheProps) {
  
  // Check if we have cached results for a specific query and page
  const getCachedResults = (query: string, lastSearchQuery: string, page: number) => {
    const isSameQuery = query === lastSearchQuery;
    if (isSameQuery && cachedResults[page]) {
      return cachedResults[page];
    }
    return null;
  };
  
  // Handle fallback to cached results when errors occur
  const handleSearchFailure = (currentPage: number) => {
    // If error occurs, check if we have cached results
    if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
      // If error occurred when changing pages, use current cached results
      setSearchResults(cachedResults[currentPage]);
      return true;
    } else if (cachedResults[1] && cachedResults[1].length > 0) {
      // If no results for current page, return to first page
      setSearchResults(cachedResults[1]);
      setCurrentPage(1);
      toast.info('Возврат к первой странице из-за ошибки');
      return true;
    }
    return false;
  };
  
  return {
    getCachedResults,
    handleSearchFailure
  };
}
