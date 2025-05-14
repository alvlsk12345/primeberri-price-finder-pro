
import { useSearchQueryState } from './search/useSearchQueryState';
import { usePaginationState } from './search/usePaginationState';
import { useResultsState } from './search/useResultsState';
import { useFiltersState } from './search/useFiltersState';
import { isOnSettingsPage, getRouteInfo } from '@/utils/navigation';

export function useSearchState() {
  console.log('[useSearchState] Инициализация хука useSearchState');
  
  // Получаем информацию о маршруте
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[useSearchState] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);
  
  // Проверяем, находимся ли мы на странице настроек
  if (inSettingsPage) {
    console.log('[useSearchState] Возвращаем заглушки состояний для страницы настроек');
    
    // Возвращаем заглушки состояний для страницы настроек
    return {
      // Базовые заглушки для SearchQueryState
      searchQuery: '', 
      setSearchQuery: () => {},
      originalQuery: '',
      setOriginalQuery: () => {},
      lastSearchQuery: '',
      setLastSearchQuery: () => {},
      hasSearched: false,
      setHasSearched: () => {},
      
      // Заглушки для ResultsState
      isLoading: false,
      setIsLoading: () => {},
      searchResults: [],
      setSearchResults: () => {},
      allSearchResults: [],
      setAllSearchResults: () => {},
      cachedResults: {},
      setCachedResults: () => {},
      selectedProduct: null,
      setSelectedProduct: () => {},
      isUsingDemoData: false,
      setIsUsingDemoData: () => {},
      apiInfo: undefined,
      setApiInfo: () => {},
      getSearchCountries: () => [],
      
      // Заглушки для PaginationState
      currentPage: 1,
      setCurrentPage: () => {},
      totalPages: 1,
      setTotalPages: () => {},
      pageChangeCount: 0,
      setPageChangeCount: () => {},
      
      // Заглушки для FiltersState
      filters: {
        price: { min: 0, max: 0 },
        brands: [],
        sources: [],
        rating: 0,
        sort: 'relevance',
        country: 'US',
      },
      setFilters: () => {},
    };
  }

  console.log('[useSearchState] Инициализация состояний поиска для основной страницы');
  
  // Get state from smaller hooks (только если не на странице настроек)
  const queryState = useSearchQueryState();
  const paginationState = usePaginationState();
  const resultsState = useResultsState();
  const filtersState = useFiltersState();

  return {
    // Search query and results
    ...queryState,
    ...resultsState,
    
    // Pagination
    ...paginationState,
    
    // Filters
    ...filtersState,
  };
}
