
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { SearchContext } from './SearchContext';
import { useSearchHandlers } from './useSearchHandlers';
import { SortOption } from "@/components/sorting/SortingMenu";
import { applySorting } from './utils/sortingUtils';

// Provider component
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cachedResults, setCachedResults] = useState<{[page: number]: Product[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [originalQuery, setOriginalQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [pageChangeCount, setPageChangeCount] = useState(0);
  const [apiErrorMode, setApiErrorMode] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Get search handlers
  const { 
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange: baseHandleSortChange
  } = useSearchHandlers(
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
    setPageChangeCount,
    setFilters,
    setSortOption
  );
  
  // Create a wrapper for handleSortChange that has access to the current searchResults
  const handleSortChange = useCallback((option: SortOption) => {
    console.log("Applying sort option:", option);
    setSortOption(option);
    
    // Apply sorting to the current results
    const sortedResults = applySorting([...searchResults], option);
    setSearchResults(sortedResults);
  }, [setSortOption, setSearchResults, searchResults]);

  // Effect for debugging page changes
  useEffect(() => {
    console.log(`Page change effect triggered: current page is ${currentPage}, change count: ${pageChangeCount}`);
  }, [currentPage, pageChangeCount]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    isLoading,
    searchResults,
    selectedProduct,
    setSelectedProduct,
    currentPage,
    totalPages,
    filters,
    setFilters,
    originalQuery,
    lastSearchQuery,
    hasSearched,
    apiErrorMode,
    sortOption,
    setSortOption,
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange,
  }), [
    searchQuery, 
    isLoading, 
    searchResults, 
    selectedProduct, 
    currentPage, 
    totalPages, 
    filters, 
    originalQuery, 
    lastSearchQuery, 
    hasSearched, 
    apiErrorMode,
    sortOption,
    handleSearch, 
    handleProductSelect, 
    handlePageChange, 
    handleFilterChange,
    handleSortChange
  ]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
