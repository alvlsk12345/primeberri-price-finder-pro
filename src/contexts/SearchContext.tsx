
import React, { createContext, useContext } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchLogic } from "@/hooks/useSearchLogic";

// Обновляем тип контекста поиска для согласования с реализацией
type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchResults: Product[];
  allSearchResults: Product[]; 
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
  // Обновляем тип handleSearch для согласования
  handleSearch: (page: number, forceNewSearch?: boolean) => Promise<void>;
  handleProductSelect: (product: Product) => void;
  handlePageChange: (page: number) => void;
  handleFilterChange: (newFilters: ProductFilters) => void;
};

// Создаем контекст с значениями по умолчанию
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Компонент провайдера
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Устраняем циклическую зависимость
  const searchLogic = useSearchLogic();
  
  // Передаем всю логику поиска в провайдер
  return <SearchContext.Provider value={searchLogic}>{children}</SearchContext.Provider>;
};

// Пользовательский хук для использования контекста поиска
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
