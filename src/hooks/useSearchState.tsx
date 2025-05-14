
import { useSearchQueryState } from './search/useSearchQueryState';
import { usePaginationState } from './search/usePaginationState';
import { useResultsState } from './search/useResultsState';
import { useFiltersState } from './search/useFiltersState';

export function useSearchState() {
  // Get state from smaller hooks
  const queryState = useSearchQueryState();
  const paginationState = usePaginationState();
  const resultsState = useResultsState();
  const filtersState = useFiltersState();

  return {
    // Search query and results
    ...queryState,
    ...resultsState,
    
    // Pagination
    ...paginationState,
    
    // Filters
    ...filtersState,
  };
}
