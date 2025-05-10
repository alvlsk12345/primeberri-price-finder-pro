
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { toast } from "sonner";
import { useSearchApiCall } from './useSearchApiCall';
import { useSearchErrorHandler } from './useSearchErrorHandler';
import { useSearchQueryTranslator } from './useSearchQueryTranslator';
import { useSearchFilterProcessor } from './useSearchFilterProcessor';

type SearchExecutorProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setSearchResults: (results: Product[]) => void;
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
  cachedResults,
  setCachedResults,
  setCurrentPage,
  setTotalPages,
  setHasSearched,
  setIsUsingDemoData,
  setApiInfo,
}: SearchExecutorProps) {
  // Сохраняем предыдущие результаты для восстановления при ошибке
  const lastSuccessfulResultsRef = useRef<Product[]>([]);
  
  // Используем хуки
  const { executeApiCall, cleanupApiCall } = useSearchApiCall({
    setIsLoading,
    setIsUsingDemoData, 
    setApiInfo
  });
  
  const { handleSearchError } = useSearchErrorHandler({
    lastSuccessfulResults: lastSuccessfulResultsRef,
    setSearchResults
  });
  
  const { translateQueryIfNeeded } = useSearchQueryTranslator();
  const { applyFiltersAndSorting } = useSearchFilterProcessor();
  
  // Счетчик попыток повторных запросов
  const retryAttemptsRef = useRef<number>(0);
  const MAX_RETRY_ATTEMPTS = 2;
  
  // Основная функция выполнения поиска
  const executeSearch = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[]
  ) => {
    console.log(`executeSearch: запрос "${queryToUse}", страница ${page}`);
    setIsLoading(true);
    
    try {
      // Устанавливаем текущую страницу
      setCurrentPage(page);
      
      // Используем оригинальный запрос без перевода для совместимости с примером
      const searchText = queryToUse;
      
      // Получаем страны для поиска, гарантируем включение Германии
      let searchCountries = getSearchCountries();
      if (!searchCountries.includes('de')) {
        searchCountries = ['de', ...searchCountries];
      }
      
      // Создаём параметры поиска на основе примера
      const searchParams: SearchParams = {
        query: searchText,
        originalQuery: queryToUse,
        page: page,
        language: 'ru',  // Устанавливаем русский язык для получения описаний на русском
        countries: searchCountries,
        filters: filters,
        requireGermanResults: true,
        minResultCount: 12, // Увеличиваем минимальное количество результатов
      };
      
      console.log('Параметры поиска:', searchParams);
      
      try {
        // Выполняем поиск через API
        const results = await executeApiCall(searchParams);
        console.log(`Поиск завершен для страницы ${page}, получено ${results.products?.length || 0} результатов`);
        
        // Сбрасываем счетчик попыток при успешном запросе
        retryAttemptsRef.current = 0;
        
        // Применяем сортировку и фильтрацию к результатам
        let sortedProducts = applyFiltersAndSorting(results.products || [], filters);
        
        // Сохраняем найденные товары
        if (sortedProducts.length > 0) {
          setSearchResults(sortedProducts);
          lastSuccessfulResultsRef.current = sortedProducts;
          
          // Обновляем кэш
          const newCache = { ...cachedResults };
          newCache[page] = sortedProducts;
          setCachedResults(newCache);
          setTotalPages(results.totalPages || 1);
          
          return { success: true, products: sortedProducts };
        } else {
          // Если API не вернул результатов
          setSearchResults([]);
          toast.error('По вашему запросу ничего не найдено. Попробуйте изменить запрос.', { duration: 4000 });
          return { success: false, products: [] };
        }
      } catch (apiError: any) {
        // Обработка ошибки API
        console.error('Ошибка при запросе к API:', apiError);
        toast.error(`Ошибка API: ${apiError.message}`, { duration: 5000 });
        
        // Возвращаем предыдущие результаты если они есть
        if (lastSuccessfulResultsRef.current.length > 0) {
          toast.info('Показаны предыдущие результаты из-за ошибки API', { duration: 3000 });
          setSearchResults(lastSuccessfulResultsRef.current);
          return { success: false, products: lastSuccessfulResultsRef.current };
        }
        
        setSearchResults([]);
        return { success: false, products: [] };
      }
    } catch (error) {
      // Повтор запроса при ошибке сети или таймауте
      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        console.log(`Ошибка при поиске. Повторная попытка ${retryAttemptsRef.current} из ${MAX_RETRY_ATTEMPTS}`);
        toast.info(`Повторный запрос (попытка ${retryAttemptsRef.current})...`, { duration: 2000 });
        
        // Задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          // Рекурсивный вызов для повторной попытки
          return await executeSearch(queryToUse, page, lastSearchQuery, filters, getSearchCountries);
        } catch (retryError) {
          console.error('Повторная попытка не удалась:', retryError);
          return handleSearchError(retryError);
        }
      } else {
        // Исчерпаны все попытки
        retryAttemptsRef.current = 0;
        return handleSearchError(error);
      }
    } finally {
      cleanupApiCall();
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  return {
    executeSearch,
    cleanupSearch: cleanupApiCall
  };
}
