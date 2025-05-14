
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { useSearchCore } from './useSearchCore';
import { isOnSettingsPage, getRouteInfo, getNormalizedRouteForLogging } from '@/utils/navigation';

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
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  // Дополнительное логирование
  console.log(`[useSearchExecutor] Инициализация, текущий маршрут: ${getNormalizedRouteForLogging()}, inSettingsPage=${inSettingsPage}`);
  
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
  const safeExecuteSearch = async (searchParams: any) => {
    // Повторная проверка перед выполнением поиска
    const currentRouteInfo = getRouteInfo();
    const currentInSettingsPage = currentRouteInfo.isSettings;
    
    if (currentInSettingsPage) {
      console.log(`[useSearchExecutor] Попытка выполнить поиск на странице настроек - отменено. Маршрут: ${getNormalizedRouteForLogging()}`);
      return [];
    }
    
    console.log(`[useSearchExecutor] Выполняем поиск, текущий маршрут: ${getNormalizedRouteForLogging()}`);
    return await executeSearch(searchParams);
  };
  
  // Обертка для cleanupSearch с дополнительными проверками
  const safeCleanupSearch = () => {
    // Повторная проверка перед очисткой
    const currentRouteInfo = getRouteInfo();
    const currentInSettingsPage = currentRouteInfo.isSettings;
    
    if (currentInSettingsPage) {
      console.log(`[useSearchExecutor] Попытка очистить поиск на странице настроек - отменено. Маршрут: ${getNormalizedRouteForLogging()}`);
      return;
    }
    
    console.log(`[useSearchExecutor] Очищаем поиск, текущий маршрут: ${getNormalizedRouteForLogging()}`);
    cleanupSearch();
  };

  return {
    executeSearch: safeExecuteSearch,
    cleanupSearch: safeCleanupSearch,
    lastSuccessfulResultsRef
  };
}
