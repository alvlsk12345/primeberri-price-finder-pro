
import { ProductFilters } from "@/services/types";
import { useSearchExecutor } from './useSearchExecutor';
import { useSearchCache } from './useSearchCache';

type SearchExecutionProps = {
  searchQuery: string;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  allSearchResults: any[];
  setAllSearchResults: (results: any[]) => void;
  cachedResults: {[page: number]: any[]};
  setCachedResults: (results: {[page: number]: any[]}) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filters: ProductFilters;
  setOriginalQuery: (query: string) => void;
  setHasSearched: (searched: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
  getSearchCountries: () => string[];
};

export function useSearchExecutionActions({
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
  filters,
  setOriginalQuery,
  setHasSearched,
  setIsUsingDemoData,
  setApiInfo,
  getSearchCountries
}: SearchExecutionProps) {
  
  // Используем наши новые рефакторинговые хуки
  const { executeSearch, cleanupSearch } = useSearchExecutor({
    isLoading,
    setIsLoading,
    setSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults, 
    setCurrentPage,
    setTotalPages: () => {}, // Временно, будет заменено
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo
  });
  
  const { getCachedResults, handleSearchFailure } = useSearchCache({
    cachedResults,
    setSearchResults,
    setCurrentPage
  });

  // Основная функция поиска с улучшенной логикой работы с кешем и страницами
  const handleSearch = async (page: number = 1, forceNewSearch: boolean = false) => {
    console.log(`handleSearch вызван: страница ${page}, forceNewSearch: ${forceNewSearch}, текущая страница: ${currentPage}`);
    
    // Проверяем, есть ли запрос для поиска
    if (!searchQuery && !lastSearchQuery) {
      console.log('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Используем текущий поисковый запрос или последний успешный
    const queryToUse = searchQuery || lastSearchQuery;
    
    // Устанавливаем текущую страницу перед выполнением поиска
    // Но только если она отличается от текущей, чтобы избежать лишних ререндеров
    if (page !== currentPage) {
      console.log(`Устанавливаем новую текущую страницу: ${page}`);
      setCurrentPage(page);
    }
    
    // Расширенная проверка кеша с более детальной диагностикой
    console.log(`Проверка кеша для запроса "${queryToUse}", страница ${page}, forceNewSearch: ${forceNewSearch}`);
    
    // Если не принудительный поиск, проверяем кеш
    const cachedResultsForQuery = !forceNewSearch ? getCachedResults(queryToUse, lastSearchQuery, page) : null;
    
    if (cachedResultsForQuery) {
      console.log(`Используем кэшированные результаты для страницы ${page}, количество: ${cachedResultsForQuery.length}`);
      setSearchResults(cachedResultsForQuery);
      return;
    }
    
    // Сохраняем оригинальный запрос (для отображения пользователю)
    setOriginalQuery(queryToUse);
    
    // Если это новый поисковый запрос, сбрасываем кеш
    const isSameQuery = queryToUse === lastSearchQuery;
    if (!isSameQuery || forceNewSearch) {
      console.log(`Новый запрос или принудительный поиск. Очищаем кэш.`);
      setLastSearchQuery(queryToUse);
      // Сбрасываем кеш результатов для нового запроса
      setCachedResults({});
    }
    
    try {
      // Подготавливаем UI к поиску
      setIsLoading(true);
      
      // Выполняем поиск с четким указанием страницы
      console.log(`Выполняем поиск для запроса "${queryToUse}", страница: ${page}`);
      const result = await executeSearch(
        queryToUse,
        page,
        lastSearchQuery,
        filters,
        getSearchCountries
      );
      
      // После успешного поиска, проверяем состояние
      console.log(`Поиск завершен. Текущая страница: ${currentPage}, запрошенная: ${page}, успех: ${result.success}`);
      
      // Если поиск был неудачным, пытаемся использовать кешированные результаты
      if (!result.success) {
        console.log(`Поиск не удался. Проверяем кэш.`);
        handleSearchFailure(page);
      }
    } catch (error) {
      console.error(`Ошибка при выполнении поиска:`, error);
      handleSearchFailure(page);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    handleSearch,
    cleanupSearch
  };
}
