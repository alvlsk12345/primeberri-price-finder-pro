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
  totalPages: number; // Добавляем totalPages в props
  setTotalPages: (pages: number) => void; // Явно добавляем setTotalPages
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
  totalPages, // Добавляем totalPages
  setTotalPages, // Добавляем setTotalPages
  filters,
  setOriginalQuery,
  setHasSearched,
  setIsUsingDemoData,
  setApiInfo,
  getSearchCountries
}: SearchExecutionProps) {
  
  // Используем наши рефакторинговые хуки, теперь с правильной передачей setTotalPages
  const { executeSearch, cleanupSearch } = useSearchExecutor({
    isLoading,
    setIsLoading,
    setSearchResults,
    setAllSearchResults,
    cachedResults,
    setCachedResults, 
    setCurrentPage,
    setTotalPages, // Передаем реальную функцию, а не пустышку
    setHasSearched,
    setIsUsingDemoData,
    setApiInfo
  });
  
  const { getCachedResults, handleSearchFailure } = useSearchCache({
    cachedResults,
    setSearchResults,
    setCurrentPage
  });

  // Основная функция поиска с улучшенной логикой работы с клиентской пагинацией
  const handleSearch = async (page: number = 1, forceNewSearch: boolean = false) => {
    console.log(`handleSearch вызван: страница ${page}, forceNewSearch: ${forceNewSearch}, текущая страница: ${currentPage}, totalPages: ${totalPages}`);
    
    // Проверяем, есть ли запрос для поиска
    if (!searchQuery && !lastSearchQuery) {
      console.log('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Используем текущий поисковый запрос или последний успешный
    const queryToUse = searchQuery || lastSearchQuery;
    
    // ВАЖНОЕ ИЗМЕНЕНИЕ: если это не новый поиск, а только смена страницы
    // и у нас уже есть все результаты - используем клиентскую пагинацию без запросов
    const isSameQuery = queryToUse === lastSearchQuery;
    const hasAllResults = allSearchResults && allSearchResults.length > 0;
    
    if (isSameQuery && hasAllResults && !forceNewSearch) {
      console.log(`Смена страницы на ${page} без повторного запроса - используем клиентскую пагинацию`);
      
      // Пересчитываем totalPages на основе allSearchResults перед сменой страницы
      if (allSearchResults.length > 0) {
        const itemsPerPage = 12;
        const calculatedPages = Math.ceil(allSearchResults.length / itemsPerPage);
        console.log(`Пересчитываем страницы: ${calculatedPages} (из ${allSearchResults.length} элементов)`);
        
        // Убеждаемся, что totalPages обновлен корректно
        if (calculatedPages !== totalPages) {
          console.log(`Корректируем общее число страниц с ${totalPages} на ${calculatedPages}`);
          setTotalPages(calculatedPages);
        }
        
        // Проверяем валидность запрашиваемой страницы
        if (page > calculatedPages) {
          console.log(`Запрошена страница ${page}, но максимум доступно ${calculatedPages}`);
          page = calculatedPages;
        }
      }
      
      // Просто меняем страницу без новых запросов
      setCurrentPage(page);
      return;
    }
    
    // Если это новый поиск или принудительный поиск, продолжаем обычный процесс
    
    // Устанавливаем текущую страни��у перед выполнением поиска
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
      
      // После успешного поиска, проверяем состояние и логируем результат включая totalPages
      console.log(`Поиск завершен. Текущая страница: ${currentPage}, запрошенная: ${page}, успех: ${result.success}, totalPages: ${totalPages}`);
      
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
