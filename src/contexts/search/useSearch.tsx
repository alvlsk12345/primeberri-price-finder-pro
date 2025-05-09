
import { useContext } from 'react';
import { SearchContext } from './SearchContext';

// Custom hook for using the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
