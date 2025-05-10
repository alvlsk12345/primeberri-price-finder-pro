
import React, { createContext, useContext, useEffect } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchLogic } from "@/hooks/useSearchLogic";

// Определяем тип контекста поиска
type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchResults: Product[];
  allSearchResults: Product[]; // Добавляем все результаты в контекст
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

// Создаем контекст с значениями по умолчанию
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Компонент провайдера
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Устраняем циклическую зависимость
  const searchLogic = useSearchLogic();
  
  // Эффект для отладки изменения страницы
  useEffect(() => {
    console.log(`Page change effect triggered: current page is ${searchLogic.currentPage}, change count: ${searchLogic.pageChangeCount}`);
  }, [searchLogic.currentPage, searchLogic.pageChangeCount]);

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
