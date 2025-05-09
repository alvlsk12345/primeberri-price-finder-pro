import { useState } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

export function useSearchState() {
  // Search query and results state
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cachedResults, setCachedResults] = useState<{[page: number]: Product[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageChangeCount, setPageChangeCount] = useState(0);
  
  // Other search-related state
  const [filters, setFilters] = useState<ProductFilters>({});
  const [originalQuery, setOriginalQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [apiInfo, setApiInfo] = useState<Record<string, string> | undefined>(undefined);

  // Helper function to get countries for search - either from filters or all
  const getSearchCountries = () => {
    return filters.countries && filters.countries.length > 0 
      ? filters.countries
      : EUROPEAN_COUNTRIES.map(country => country.code);
  };

  return {
    // Search query and results
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    searchResults,
    setSearchResults,
    cachedResults,
    setCachedResults,
    selectedProduct,
    setSelectedProduct,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    pageChangeCount,
    setPageChangeCount,
    
    // Other search-related state
    filters,
    setFilters,
    originalQuery,
    setOriginalQuery,
    lastSearchQuery,
    setLastSearchQuery,
    hasSearched,
    setHasSearched,
    isUsingDemoData,
    setIsUsingDemoData,
    apiInfo,
    setApiInfo,
    
    // Helpers
    getSearchCountries,
  };
}
