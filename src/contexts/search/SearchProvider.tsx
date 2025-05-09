
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { SearchContext } from './SearchContext';
import { useSearchHandlers } from './useSearchHandlers';

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

  const { 
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange
  } = useSearchHandlers(
    searchQuery,
    lastSearchQuery,
    filters,
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
    setPageChangeCount
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
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
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
    handleSearch, 
    handleProductSelect, 
    handlePageChange, 
    handleFilterChange
  ]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
