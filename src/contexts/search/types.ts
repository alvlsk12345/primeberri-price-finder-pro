
import { Product, ProductFilters } from "@/services/types";
import { SortOption } from "@/components/sorting/SortingMenu";

// Define the search context type
export type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void; // Add this line
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currentPage: number;
  totalPages: number;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  originalQuery: string;
  lastSearchQuery: string;
  hasSearched: boolean;
  apiErrorMode: boolean;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  handleSearch: (page?: number, forceNewSearch?: boolean) => Promise<void>;
  handleProductSelect: (product: Product) => void;
  handlePageChange: (page: number) => void;
  handleFilterChange: (newFilters: ProductFilters) => void;
  handleSortChange: (option: SortOption) => void;
};
