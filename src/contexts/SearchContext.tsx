
import React, { createContext, useContext } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchLogic } from "@/hooks/useSearchLogic";
import { isOnSettingsPage } from "@/utils/navigation";

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
  isOnSettingsPage: boolean; // Добавляем флаг страницы настроек
};

// Создаем контекст с значениями по умолчанию
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Компонент провайдера с проверкой страницы настроек
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inSettingsPage = isOnSettingsPage();
  
  // Устраняем циклическую зависимость и защищаем от ошибок на странице настроек
  const searchLogic = useSearchLogic();
  
  // Передаем всю логику поиска в провайдер
  return <SearchContext.Provider value={searchLogic}>{children}</SearchContext.Provider>;
};

// Пользовательский хук для использования контекста поиска с защитой от ошибок
export const useSearch = () => {
  // Сначала проверяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();
  
  // На странице настроек возвращаем заглушку вместо контекста
  if (inSettingsPage) {
    // Возвращаем заглушку с базовыми значениями
    console.log('useSearch: использована заглушка для страницы настроек');
    return {
      searchQuery: '',
      setSearchQuery: () => {},
      isLoading: false,
      searchResults: [],
      allSearchResults: [],
      selectedProduct: null,
      setSelectedProduct: () => {},
      currentPage: 1,
      totalPages: 1,
      filters: {
        price: { min: 0, max: 0 },
        brands: [],
        sources: [],
        rating: 0,
        sort: 'relevance',
        country: 'US',
      },
      setFilters: () => {},
      originalQuery: '',
      lastSearchQuery: '',
      hasSearched: false,
      isUsingDemoData: false,
      apiInfo: {},
      handleSearch: async () => {},
      handleProductSelect: () => {},
      handlePageChange: () => {},
      handleFilterChange: () => {},
      isOnSettingsPage: true
    } as SearchContextType;
  }
  
  // Если не страница настроек, используем обычный контекст
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
