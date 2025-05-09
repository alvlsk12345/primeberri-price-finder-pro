
import { useState } from 'react';

export function useSearchQueryState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    searchQuery,
    setSearchQuery,
    originalQuery,
    setOriginalQuery,
    lastSearchQuery,
    setLastSearchQuery,
    hasSearched,
    setHasSearched,
    isLoading,
    setIsLoading,
  };
}
