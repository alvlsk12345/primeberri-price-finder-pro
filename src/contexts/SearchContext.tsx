
import React, { createContext, useContext, useEffect } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchLogic } from "@/hooks/useSearchLogic";

// Define the search context type
type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchResults: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currentPage: number;
  totalPages: number;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  originalQuery: string;
  lastSearchQuery: string;
  hasSearched: boolean;
  isUsingDemoData: boolean;
  apiInfo?: Record<string, string>;
  handleSearch: (page?: number, forceNewSearch?: boolean) => Promise<void>;
  handleProductSelect: (product: Product) => void;
  handlePageChange: (page: number) => void;
  handleFilterChange: (newFilters: ProductFilters) => void;
};

// Create context with default values
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchLogic = useSearchLogic();
  
  // Effect для отладки изменения страницы
  useEffect(() => {
    console.log(`Page change effect triggered: current page is ${searchLogic.currentPage}, change count: ${searchLogic.pageChangeCount}`);
  }, [searchLogic.currentPage, searchLogic.pageChangeCount]);

  // Pass all the search logic to the provider
  return <SearchContext.Provider value={searchLogic}>{children}</SearchContext.Provider>;
};

// Custom hook for using the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
