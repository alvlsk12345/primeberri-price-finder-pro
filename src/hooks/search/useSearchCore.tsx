
import { Product, ProductFilters } from "@/services/types";
import { toast } from "sonner";
import { useSearchApiCall } from './useSearchApiCall';
import { useSearchRetry } from './useSearchRetry'; 
import { useSearchFilterProcessor } from './useSearchFilterProcessor';

type SearchCoreProps = {
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
  lastSuccessfulResultsRef: React.MutableRefObject<Product[]>;
};

export function useSearchCore({
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
  lastSuccessfulResultsRef,
}: SearchCoreProps) {
  
  // Используем хуки
  const { executeApiCall, cleanupApiCall } = useSearchApiCall({
    setIsLoading,
    setIsUsingDemoData, 
    setApiInfo
  });
  
  const { applyFiltersAndSorting } = useSearchFilterProcessor();

  // Обработчик ошибок поиска
  const handleSearchError = (error: any): { success: boolean, products: Product[], recovered?: boolean } => {
    console.error('Ошибка поиска:', error);
    
    if (lastSuccessfulResultsRef.current.length > 0) {
      // В случае ошибки возвращаем последние успешные результаты
      console.log('Произошла ошибка при поиске, возвращаем предыдущие результаты');
      setSearchResults(lastSuccessfulResultsRef.current);
      return { success: true, products: lastSuccessfulResultsRef.current, recovered: true };
    }
    
    return { success: false, products: [] };
  };
  
  // Хук для повторных попыток поиска
  const { executeSearchWithRetry, resetRetryAttempts } = useSearchRetry({
    executeSearch: async (queryToUse, page, lastSearchQuery, filters, getSearchCountries) => {
      return await executeSearchCore(queryToUse, page, lastSearchQuery, filters, getSearchCountries);
    },
    handleSearchError
  });
  
  // Основная функция выполнения поиска
  const executeSearchCore = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[]
  ) => {
    console.log(`executeSearchCore: запрос "${queryToUse}", страница ${page}`);
    
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
    const searchParams = {
      query: searchText,
      originalQuery: queryToUse,
      page: page,
      language: 'ru',  // Устанавливаем русский язык для получения описаний на русском
      countries: searchCountries,
      filters: filters,
      requireGermanResults: true,
      minResultCount: 36, // Увеличиваем до 36 для имитации полной загрузки
    };
    
    console.log('Параметры поиска:', searchParams);
    
    // Выполняем поиск через API
    const results = await executeApiCall(searchParams);
    console.log(`Поиск завершен для страницы ${page}, получено ${results.products?.length || 0} результатов`);
    
    // Сбрасываем счетчик попыток при успешном запросе
    resetRetryAttempts();
    
    // Сохраняем полные нефильтрованные результаты
    if (results.products && results.products.length > 0) {
      console.log(`Сохраняем ${results.products.length} полных результатов поиска в allSearchResults`);
      setAllSearchResults(results.products);
      
      // ВАЖНО: Вычисляем и устанавливаем правильное количество страниц
      // на основе полного набора результатов
      const itemsPerPage = 12; // Соответствует значению в SearchResults.tsx
      const calculatedTotalPages = Math.max(1, Math.ceil(results.products.length / itemsPerPage));
      console.log(`Вычисляем общее количество страниц на основе ${results.products.length} результатов: ${calculatedTotalPages}`);
      
      // Гарантированно устанавливаем общее количество страниц
      // используем максимальное из вычисленного и полученного от API
      const finalTotalPages = Math.max(calculatedTotalPages, results.totalPages || 1);
      console.log(`Устанавливаем общее количество страниц: ${finalTotalPages}`);
      setTotalPages(finalTotalPages);
    } else {
      // Если нет результатов, устанавливаем 1 страницу
      console.log(`Нет результатов поиска, устанавливаем 1 страницу`);
      setTotalPages(1);
    }
    
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
      
      return { success: true, products: sortedProducts };
    } else {
      // Если API не вернул результатов
      setSearchResults([]);
      setTotalPages(1); // Явно устанавливаем 1 страницу при отсутствии результатов
      toast.error('По вашему запросу ничего не найдено. Попробуйте изменить запрос.', { duration: 4000 });
      return { success: false, products: [] };
    }
  };

  // Основная функция выполнения поиска с ретраями
  const executeSearch = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[]
  ) => {
    setIsLoading(true);
    
    try {
      return await executeSearchWithRetry(queryToUse, page, lastSearchQuery, filters, getSearchCountries);
    } catch (error) {
      console.error(`Критическая ошибка при выполнении поиска:`, error);
      return handleSearchError(error);
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
