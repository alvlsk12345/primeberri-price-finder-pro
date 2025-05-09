
import { useRef } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { translateToEnglish, containsCyrillicCharacters } from "@/services/translationService";

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
  // Timeout reference to ensure we can cancel pending timeouts
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Execute search with given parameters
  const executeSearch = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters,
    getSearchCountries: () => string[]
  ) => {
    console.log(`executeSearch called with page: ${page}, query: ${queryToUse}`);
    setIsLoading(true);
    setIsUsingDemoData(false);
    
    // Set a timeout to ensure search doesn't hang for too long
    const searchTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.log('Поиск занял слишком много времени');
      }
    }, 10000); // 10 seconds timeout
    
    searchTimeoutRef.current = searchTimeout;
    
    try {
      // Переводим запрос на английский, если он на русском
      let searchText = queryToUse;
      let translatedQuery = queryToUse;
      
      if (containsCyrillicCharacters(queryToUse)) {
        console.log("Обнаружен запрос на русском языке. Выполняем перевод...");
        translatedQuery = await translateToEnglish(queryToUse);
        console.log(`Запрос "${queryToUse}" переведен как "${translatedQuery}"`);
        searchText = translatedQuery;
      }
      
      // Всегда устанавливаем текущую страницу перед выполнением запроса
      console.log(`Устанавливаем текущую страницу: ${page}`);
      setCurrentPage(page);
      
      // Get search countries - ensure we have German results
      const searchCountries = getSearchCountries();
      // Make sure Germany ('de') is included in search countries
      if (!searchCountries.includes('de')) {
        searchCountries.push('de');
      }
      
      // Create search params
      const searchParams: SearchParams = {
        query: searchText,
        originalQuery: queryToUse, // Сохраняем оригинальный запрос
        page: page,
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters,
        requireGermanResults: true, // Add flag to ensure German results
        minResultCount: 10 // Ensure minimum 10 results
      };
      
      // Execute the search
      const results = await searchProducts(searchParams);
      console.log(`Search completed for page ${page}, got ${results.products.length} results`);
      
      // Check if we're using demo data and update state
      if (results.isDemo) {
        setIsUsingDemoData(true);
        // Reset API info when using demo data
        setApiInfo(undefined);
      } else if (results.apiInfo) {
        // Update API info if available
        setApiInfo(results.apiInfo);
      }
      
      // Apply sorting and filtering to results if needed
      let sortedProducts = [...results.products];
      
      // Применяем фильтры к продуктам
      if (filters) {
        // Фильтр по цене - исправлено для корректной работы с числовыми значениями
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          sortedProducts = sortedProducts.filter(product => {
            const productPrice = typeof product._numericPrice === 'number' 
              ? product._numericPrice 
              : parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
            
            if (filters.minPrice !== undefined && productPrice < filters.minPrice) {
              return false;
            }
            if (filters.maxPrice !== undefined && productPrice > filters.maxPrice) {
              return false;
            }
            return true;
          });
        }
        
        // Фильтр по рейтингу - исправлено для корректной работы
        if (filters.rating !== undefined && filters.rating > 0) {
          sortedProducts = sortedProducts.filter(product => {
            const rating = typeof product.rating === 'number' ? product.rating : 0;
            return rating >= filters.rating;
          });
        }
      }
      
      // Применяем сортировку
      if (filters && filters.sortBy) {
        switch(filters.sortBy) {
          case 'price_asc':
            sortedProducts = sortedProducts.sort((a, b) => {
              const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
              const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
              return priceA - priceB;
            });
            break;
          case 'price_desc':
            sortedProducts = sortedProducts.sort((a, b) => {
              const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
              const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
              return priceB - priceA;
            });
            break;
          case 'rating_desc':
            sortedProducts = sortedProducts.sort((a, b) => {
              const ratingA = typeof a.rating === 'number' ? a.rating : 0;
              const ratingB = typeof b.rating === 'number' ? b.rating : 0;
              return ratingB - ratingA;
            });
            break;
        }
      }
      
      // Save found products to state and cache
      if (sortedProducts.length > 0) {
        console.log(`После применения фильтров и сортировки осталось ${sortedProducts.length} товаров`);
        setSearchResults(sortedProducts);
        
        // Create a new object instead of using a function
        const newCache = { ...cachedResults };
        newCache[page] = sortedProducts;
        setCachedResults(newCache);
        setTotalPages(results.totalPages);
        
        console.log(`Найдено ${sortedProducts.length} товаров!`);
        
        return { success: true, products: sortedProducts };
      } 
      
      setSearchResults([]);
      console.log('По вашему запросу ничего не найдено.');
      return { success: false, products: [] };
    } catch (error) {
      console.error('Ошибка поиска:', error);
      return { success: false, error };
    } finally {
      clearTimeout(searchTimeout);
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  // Cleanup function
  const cleanupSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  return {
    executeSearch,
    cleanupSearch
  };
}
