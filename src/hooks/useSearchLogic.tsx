
import { useEffect, useRef } from 'react';
import { useSearchState } from './useSearchState';
import { useSearchActions } from './useSearchActions';

export function useSearchLogic() {
  // Get all search state from our custom hook
  const searchState = useSearchState();
  
  // Get all search actions from our custom hook
  const searchActions = useSearchActions(searchState);
  
  // Effect for debug logging on page changes
  useEffect(() => {
    console.log(`Page change effect triggered: current page is ${searchState.currentPage}, change count: ${searchState.pageChangeCount}`);
  }, [searchState.currentPage, searchState.pageChangeCount]);

  // Cleanup effect
  useEffect(() => {
    return searchActions.cleanupSearch;
  }, []);

  // Return all state and actions as a single object
  return {
    ...searchState,
    ...searchActions
  };
}
