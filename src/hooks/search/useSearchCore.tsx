
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
    
    // Сохраняем информацию об ошибке
    setApiInfo({
      error: error instanceof Error ? error.message : String(error),
      time: new Date().toISOString(),
      errorType: 'search_error'
    });
    
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
    executeSearch: async (queryToUse, page, lastSearchQuery, filters, getSearchCountries, forceNewSearch) => {
      return await executeSearchCore(queryToUse, page, lastSearchQuery, filters, getSearchCountries, forceNewSearch);
    },
    handleSearchError
  });
  
  // Основная функция выполнения поиска
  const executeSearchCore = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[],
    forceNewSearch: boolean = false
  ) => {
    console.log(`executeSearchCore: запрос "${queryToUse}", страница ${page}, forceNewSearch: ${forceNewSearch}`);
    
    // Устанавливаем текущую страницу
    setCurrentPage(page);
    
    // Используем оригинальный запрос без перевода для совместимости с примером
    const searchText = queryToUse;
    
    // Получаем страны для поиска, гарантируем включение Германии
    let searchCountries = getSearchCountries();
    if (!searchCountries.includes('de')) {
      searchCountries = ['de', ...searchCountries];
    }
    
    // ИСПРАВЛЕНИЕ: создаём параметры поиска с запросом 36 товаров
    const searchParams = {
      query: searchText,
      originalQuery: queryToUse,
      page: page,
      language: 'ru',
      countries: searchCountries,
      filters: filters,
      requireGermanResults: true,
      minResultCount: 36, // ИСПРАВЛЕНИЕ: запрашиваем 36 результатов
      limit: 36, // ИСПРАВЛЕНИЕ: явно указываем лимит в 36 результатов
    };
    
    console.log('Параметры поиска:', searchParams);
    
    // Выполняем поиск через API с передачей флага forceNewSearch
    const results = await executeApiCall(searchParams, forceNewSearch);
    console.log(`Поиск завершен для страницы ${page}, получено ${results.products?.length || 0} результатов, forceNewSearch: ${forceNewSearch}`);
    
    // Сбрасываем счетчик попыток при успешном запросе
    resetRetryAttempts();
    
    // ИСПРАВЛЕНИЕ: проверяем ответ API и показываем реальное количество найденных результатов
    if (results.products) {
      console.log(`Количество полученных результатов: ${results.products.length}`);
      
      // Если в API totalResults показывает меньше, чем реально получено товаров,
      // корректируем это значение
      if (results.totalResults && results.totalResults < results.products.length) {
        console.log(`Исправляем totalResults с ${results.totalResults} на ${results.products.length}`);
        results.totalResults = results.products.length;
      }
    }
    
    // Сохраняем полные нефильтрованные результаты
    if (results.products && results.products.length > 0) {
      console.log(`Сохраняем ${results.products.length} полных результатов поиска в allSearchResults`);
      setAllSearchResults(results.products);
      
      // ИСПРАВЛЕНИЕ: для 36 товаров на одной странице устанавливаем 1 страницу
      const calculatedTotalPages = 1; // Все 36 товаров на одной странице
      console.log(`Устанавливаем общее количество страниц: ${calculatedTotalPages} (все товары на одной странице)`);
      setTotalPages(calculatedTotalPages);
      
      // ИСПРАВЛЕНИЕ: добавляем информацию о количестве найденных товаров в apiInfo
      setApiInfo({
        ...results.apiInfo,
        totalResults: String(results.products.length),
        itemsPerPage: "36"
      });
    } else {
      // Если нет результатов, устанавливаем 1 страницу
      console.log(`Нет результатов поиска, устанавливаем 1 страницу`);
      setTotalPages(1);
    }
    
    // ИСПРАВЛЕНИЕ: применяем сортировку и фильтрацию к результатам
    let sortedProducts = applyFiltersAndSorting(results.products || [], filters);
    
    // Сохраняем найденные товары
    if (sortedProducts.length > 0) {
      // Выводим информацию о количестве результатов в консоль для отладки
      console.log(`Отображаем ${sortedProducts.length} отфильтрованных результатов из ${results.products?.length || 0} полученных`);
      
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
    getSearchCountries: () => string[],
    forceNewSearch: boolean = false
  ) => {
    setIsLoading(true);
    
    try {
      return await executeSearchWithRetry(queryToUse, page, lastSearchQuery, filters, getSearchCountries, forceNewSearch);
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
