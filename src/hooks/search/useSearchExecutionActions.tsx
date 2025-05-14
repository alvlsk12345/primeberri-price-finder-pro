
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { useSearchExecutor } from "./useSearchExecutor";
import { useSearchQueryTranslator } from './useSearchQueryTranslator';
import { useSearchFilterProcessor } from './useSearchFilterProcessor';

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings") ||
         document.body.getAttribute('data-path') === '/settings';
};

type SearchExecutionProps = {
  searchQuery: string;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: Product[];
  setSearchResults: (results: Product[]) => void;
  allSearchResults: Product[];
  setAllSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  filters: ProductFilters;
  setOriginalQuery: (query: string) => void;
  setHasSearched: (searched: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
  getSearchCountries: () => string[];
};

export function useSearchExecutionActions(props: SearchExecutionProps) {
  const { 
    searchQuery, 
    lastSearchQuery,
    setLastSearchQuery,
    isLoading,
    setIsLoading,
    searchResults,
    setSearchResults,
    allSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    filters,
    setOriginalQuery,
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo,
    getSearchCountries
  } = props;

  // Проверяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();
  
  // Используем хуки для разных аспектов поиска
  const { translateQueryIfNeeded } = useSearchQueryTranslator();
  const { applyFiltersAndSorting } = useSearchFilterProcessor();
  
  // Используем исполнитель поиска
  const { executeSearch, cleanupSearch } = useSearchExecutor({
    isLoading,
    setIsLoading,
    setSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults,
    setCurrentPage,
    setTotalPages,
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo,
  });
  
  // Отслеживаем количество запросов к API
  const searchRequestCountRef = useRef<number>(0);
  
  // Основная функция для выполнения поиска
  const handleSearch = async (options?: { 
    forcePage?: number; 
    forceRefresh?: boolean;
    initialSearch?: boolean;
    customQuery?: string;
  }) => {
    // На странице настроек не выполняем реальный поиск
    if (inSettingsPage) {
      return;
    }
    
    const {
      forcePage,
      forceRefresh = false,
      initialSearch = false,
      customQuery
    } = options || {};
    
    // Используем пользовательский запрос, если он предоставлен, иначе текущий
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;
    
    // Если запрос пустой и это не начальный поиск - отменяем
    if (!queryToUse.trim() && !initialSearch) return;
    
    try {
      // Проверяем, изменился ли запрос
      const queryChanged = queryToUse !== lastSearchQuery;
      
      // Устанавливаем флаг загрузки
      setIsLoading(true);
      
      // Если запрос не изменился и нет принудительного обновления - используем кеш
      if (!queryChanged && !forceRefresh) {
        const targetPage = forcePage !== undefined ? forcePage : currentPage;
        
        // Проверяем наличие результатов в кеше для текущей страницы
        if (cachedResults[targetPage] && cachedResults[targetPage].length > 0) {
          // Используем кешированные результаты
          setSearchResults(cachedResults[targetPage]);
          setIsLoading(false);
          return;
        }
      }
      
      // Увеличиваем счетчик запросов
      searchRequestCountRef.current += 1;
      const currentRequest = searchRequestCountRef.current;
      
      // Сохраняем оригинальный запрос
      setOriginalQuery(queryToUse);
      
      // Переводим запрос при необходимости
      const translationResult = await translateQueryIfNeeded(queryToUse);
      const translatedQuery = translationResult.translatedQuery;
      
      // Выполняем поиск с правильными параметрами в формате SearchParams
      const searchResponse = await executeSearch({
        query: translatedQuery || queryToUse,
        page: forcePage !== undefined ? forcePage : currentPage,
        lastSearchQuery,
        filters,
        getSearchCountries
      });
      
      // Проверяем, что запрос все еще актуален
      if (currentRequest !== searchRequestCountRef.current) {
        // Более новый запрос уже в обработке, игнорируем результаты
        return;
      }

      // Обрабатываем результаты
      if (searchResponse && typeof searchResponse === 'object' && 'products' in searchResponse) {
        const filteredResults = applyFiltersAndSorting(searchResponse.products || [], filters);
        setSearchResults(filteredResults);
      } else if (Array.isArray(searchResponse)) {
        const filteredResults = applyFiltersAndSorting(searchResponse, filters);
        setSearchResults(filteredResults);
      }
      
      // Сохраняем последний успешный запрос
      setLastSearchQuery(queryToUse);
      
    } catch (error) {
      console.error('Ошибка во время выполнения поиска:', error);
    } finally {
      // Завершаем загрузку
      setIsLoading(false);
    }
  };
  
  return {
    handleSearch,
    cleanupSearch
  };
}
