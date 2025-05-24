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
  totalPages: number; 
  setTotalPages: (pages: number) => void; 
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
  totalPages, 
  setTotalPages, 
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
    setTotalPages, 
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
    try {
      if (!searchQuery.trim()) {
        console.log('Пустой поисковый запрос, очищаем результаты');
        setSearchResults([]);
        setAllSearchResults([]);
        setTotalPages(1);
        return;
      }

      const isSameQuery = searchQuery === lastSearchQuery;
      const hasAllResults = allSearchResults.length > 0;
      
      console.log(`Поиск: "${searchQuery}", страница ${page}, принудительный: ${forceNewSearch}`);
      console.log(`Тот же запрос: ${isSameQuery}, есть все результаты: ${hasAllResults}`);
      
      if (isSameQuery && hasAllResults && !forceNewSearch) {
        console.log(`Смена страницы на ${page} без повторного запроса - используем клиентскую пагинацию`);
        
        // Используем размер страницы 36 для соответствия API
        const itemsPerPage = 36;
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
        
        // Вычисляем индексы для текущей страницы
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Получаем товары для текущей страницы
        const pageProducts = allSearchResults.slice(startIndex, endIndex);
        setSearchResults(pageProducts);
        
        // Обновляем текущую страницу
        setCurrentPage(page);
        return;
      }
      
      // Если это новый поиск или принудительный поиск
      setIsLoading(true);
      
      // Выполняем поиск
      const { products, totalPages: newTotalPages, isDemo, apiInfo } = await executeSearch(
        searchQuery,
        page,
        forceNewSearch,
        getSearchCountries(),
        filters,
        lastSearchQuery
      );
      
      console.log(`Получено ${products.length} товаров, всего страниц: ${newTotalPages}`);
      
      // Обновляем состояние
      setSearchResults(products);
      setAllSearchResults(products);
      setTotalPages(newTotalPages || 1);
      setCurrentPage(page);
      setLastSearchQuery(searchQuery);
      setOriginalQuery(searchQuery);
      setHasSearched(true);
      setIsUsingDemoData(isDemo || false);
      setApiInfo(apiInfo);
      
    } catch (error) {
      console.error('Ошибка при выполнении поиска:', error);
      setSearchResults([]);
      setTotalPages(1);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    handleSearch,
    cleanupSearch
  };
}
