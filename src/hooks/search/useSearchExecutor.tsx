
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { useSearchCore } from './useSearchCore';
import { isOnSettingsPage } from '@/utils/navigation';

type SearchExecutorProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setSearchResults: (results: Product[]) => void;
  setAllSearchResults: (results: Product[]) => void;
  cachedResults: {[page: number]: Product[]};
  setCachedResults: (results: {[page: number]: Product[]}) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasSearched: (searched: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
};

export function useSearchExecutor({
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
}: SearchExecutorProps) {
  // Проверка на страницу настроек для предотвращения выполнения поиска
  const inSettingsPage = isOnSettingsPage();
  
  // Сохраняем предыдущие результаты для восстановления при ошибке
  const lastSuccessfulResultsRef = useRef<Product[]>([]);
  
  // Используем основной хук для поиска
  const { executeSearch, cleanupSearch } = useSearchCore({
    setIsLoading,
    setSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults, 
    setCurrentPage,
    setTotalPages,
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo
  });
  
  // Обертка для executeSearch с дополнительными проверками
  const safeExecuteSearch = async (searchParams: SearchParams, forceNewSearch: boolean = false) => {
    if (inSettingsPage) {
      console.log('Попытка выполнить поиск на странице настроек - отменено');
      return [];
    }
    
    return await executeSearch(searchParams, forceNewSearch);
  };
  
  // Обертка для cleanupSearch с дополнительными проверками
  const safeCleanupSearch = () => {
    if (inSettingsPage) {
      console.log('Попытка очистить поиск на странице настроек - отменено');
      return;
    }
    
    cleanupSearch();
  };

  return {
    executeSearch: safeExecuteSearch,
    cleanupSearch: safeCleanupSearch,
    lastSuccessfulResultsRef
  };
}
