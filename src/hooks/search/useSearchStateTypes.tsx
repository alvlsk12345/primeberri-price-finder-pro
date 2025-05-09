import { Product, ProductFilters } from "@/services/types";

export type SearchStateType = {
  // Search query and results
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  
  // Other search-related state
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  originalQuery: string;
  setOriginalQuery: (query: string) => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  isUsingDemoData: boolean;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  apiInfo: Record<string, string> | undefined;
  setApiInfo: (info: Record<string, string> | undefined) => void;
  
  // Helpers
  getSearchCountries: () => string[];
};
