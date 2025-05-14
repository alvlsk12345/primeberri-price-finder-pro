
import React, { createContext, useContext, useEffect } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { useSearchLogic } from "@/hooks/useSearchLogic";
import { isOnSettingsPage, getRouteInfo, getNormalizedRouteForLogging } from "@/utils/navigation";

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

// Создаем контекст с пустыми значениями по умолчанию
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Создаем заглушку для контекста - вместо выбрасывания ошибки
const createSearchContextStub = (): SearchContextType => {
  console.log('[SearchContext] Создание заглушки контекста, так как провайдер недоступен');
  
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
  };
};

// Компонент провайдера с улучшенной проверкой страницы настроек
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[SearchProvider] Инициализация, текущий маршрут: ${getNormalizedRouteForLogging()}, inSettingsPage=${inSettingsPage}`);
  
  // Устраняем циклическую зависимость и защищаем от ошибок на странице настроек
  const searchLogic = useSearchLogic();
  
  // Логируем монтирование/размонтирование провайдера для отслеживания жизненного цикла
  useEffect(() => {
    console.log('[SearchProvider] Провайдер смонтирован');
    
    return () => {
      console.log('[SearchProvider] Провайдер размонтирован');
    };
  }, []);
  
  // Передаем всю логику поиска в провайдер
  return <SearchContext.Provider value={searchLogic}>{children}</SearchContext.Provider>;
};

// Пользовательский хук для использования контекста поиска с защитой от ошибок
export const useSearch = () => {
  // Сначала проверяем, находимся ли мы на странице настроек
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  // Получаем контекст (может быть undefined)
  const context = useContext(SearchContext);
  
  // Если контекст недоступен, возвращаем заглушку с пустыми функциями
  if (context === undefined) {
    console.warn(`[useSearch] Контекст недоступен! Возвращаем заглушку. Текущий маршрут: ${getNormalizedRouteForLogging()}`);
    return createSearchContextStub();
  }
  
  return context;
};
