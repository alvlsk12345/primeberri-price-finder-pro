
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { SearchContext } from './SearchContext';
import { useSearchHandlers } from './useSearchHandlers';
import { SortOption } from "@/components/sorting/SortingMenu";

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

  const { 
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange
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
    setSearchResults, // Add setSearchResults to the context value
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
    setSearchResults, // Add setSearchResults to dependency array
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
