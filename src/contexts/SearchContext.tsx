
import React, { createContext, useContext, ReactNode } from 'react';
import { Product, ProductFilters } from '@/services/types';

// Определяем типы для нашего контекста
type SearchContextType = {
  // Состояния поиска
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  originalQuery: string;
  setOriginalQuery: (query: string) => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  
  // Состояния результатов
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  allSearchResults: Product[];
  setAllSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isUsingDemoData: boolean;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  apiInfo: Record<string, string> | undefined;
  setApiInfo: (info: Record<string, string> | undefined) => void;
  getSearchCountries: () => string[];
  
  // Состояния пагинации
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  
  // Состояния фильтров
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  
  // Действия
  handleSearch: (page: number, forceNewSearch?: boolean) => Promise<void>;
  handleProductSelect: (product: Product) => void;
  handlePageChange: (page: number) => void;
  handleFilterChange: (filterNameOrFilters: string | ProductFilters, value?: any) => void;
  cleanupSearch: () => void;
  isOnSettingsPage: boolean;
};

// Значения по умолчанию для контекста
const defaultSearchContext: SearchContextType = {
  searchQuery: '',
  setSearchQuery: () => {},
  originalQuery: '',
  setOriginalQuery: () => {},
  lastSearchQuery: '',
  setLastSearchQuery: () => {},
  hasSearched: false,
  setHasSearched: () => {},
  
  isLoading: false,
  setIsLoading: () => {},
  searchResults: [],
  setSearchResults: () => {},
  allSearchResults: [],
  setAllSearchResults: () => {},
  cachedResults: {},
  setCachedResults: () => {},
  selectedProduct: null,
  setSelectedProduct: () => {},
  isUsingDemoData: false,
  setIsUsingDemoData: () => {},
  apiInfo: undefined,
  setApiInfo: () => {},
  getSearchCountries: () => [],
  
  currentPage: 1,
  setCurrentPage: () => {},
  totalPages: 1,
  setTotalPages: () => {},
  pageChangeCount: 0,
  setPageChangeCount: () => {},
  
  filters: {
    minPrice: 0,
    maxPrice: 0,
    brands: [],
    sources: [],
    rating: 0,
    sortBy: "relevance",
    country: 'US',
  },
  setFilters: () => {},
  
  handleSearch: async () => {},
  handleProductSelect: () => {},
  handlePageChange: () => {},
  handleFilterChange: () => {},
  cleanupSearch: () => {},
  isOnSettingsPage: false
};

// Создаем контекст поиска
const SearchContext = createContext<SearchContextType>(defaultSearchContext);

// Хук для использования контекста поиска
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    console.error('useSearch должен использоваться внутри SearchProvider');
    // Возвращаем заглушку вместо выброса ошибки
    return defaultSearchContext;
  }
  return context;
};

// Провайдер контекста поиска
export const SearchProvider = ({ children, searchState }: { children: ReactNode, searchState: SearchContextType }) => {
  return (
    <SearchContext.Provider value={searchState}>
      {children}
    </SearchContext.Provider>
  );
};

// Компонент для безопасного рендеринга
export const SafeRenderComponent = ({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode, 
  fallback?: ReactNode 
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Ошибка при рендеринге компонента:', error);
    return <>{fallback}</>;
  }
};

export default SearchContext;
