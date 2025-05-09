
import { useState, useCallback } from 'react';
import { Product, ProductFilters } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

export const useSearchHandlers = (
  searchQuery: string,
  lastSearchQuery: string,
  filters: ProductFilters,
  cachedResults: {[page: number]: Product[]},
  currentPage: number,
  setSelectedProduct: (product: Product | null) => void,
  setSearchResults: (results: Product[]) => void,
  setCurrentPage: (page: number) => void,
  setTotalPages: (pages: number) => void,
  setCachedResults: React.Dispatch<React.SetStateAction<{[page: number]: Product[]}>>,
  setLastSearchQuery: (query: string) => void,
  setOriginalQuery: (query: string) => void,
  setHasSearched: (hasSearched: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setApiErrorMode: (errorMode: boolean) => void,
  setPageChangeCount: React.Dispatch<React.SetStateAction<number>>
) => {
  // Product selection handler
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Memoized search function
  const handleSearch = useCallback(async (page: number = 1, forceNewSearch: boolean = false) => {
    // Check if there's a query for search
    if (!searchQuery && !lastSearchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Use current search query or last successful one
    const queryToUse = searchQuery || lastSearchQuery;
    
    setIsLoading(true);
    setApiErrorMode(false); // Сбрасываем состояние ошибки API перед новым запросом
    
    try {
      // If it's the same page for the same query and we have cached results
      const isSameQuery = queryToUse === lastSearchQuery;
      if (!forceNewSearch && isSameQuery && cachedResults[page]) {
        console.log(`Используем кэшированные результаты для страницы ${page}`);
        setSearchResults(cachedResults[page]);
        setCurrentPage(page);
        setIsLoading(false);
        return;
      }
      
      // Save original query (for display to user)
      setOriginalQuery(queryToUse);
      
      // If this is a new search query, save it
      if (!isSameQuery || forceNewSearch) {
        setLastSearchQuery(queryToUse);
        // Reset results cache for new query
        setCachedResults({});
      }
      
      // Set current page before executing request
      setCurrentPage(page);
      
      // Определяем страны для поиска - либо из фильтров, либо все
      const searchCountries = filters.countries && filters.countries.length > 0 
        ? filters.countries
        : EUROPEAN_COUNTRIES.map(country => country.code);
      
      // Use query directly - no translation needed
      const results = await searchProducts({
        query: queryToUse,
        page: page,
        language: 'en', // Always use English for best results
        countries: searchCountries,
        filters: filters
      });
      
      // Проверяем, были ли использованы мок-данные из-за ошибки API
      if (results.fromMock) {
        setApiErrorMode(true);
        console.log('Использованы мок-данные из-за ошибки API');
      }
      
      // Save found products to state and cache
      if (results.products.length > 0) {
        setSearchResults(results.products);
        setCachedResults(prev => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
        toast.success(`Найдено ${results.products.length} товаров!`);
      } else {
        // Check if we have results in cache for current search query
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          setSearchResults(cachedResults[1]);
          setCurrentPage(1);
          toast.info('Ошибка при загрузке страницы, показаны результаты первой страницы');
        } else {
          setSearchResults([]);
          toast.info('По вашему запросу ничего не найдено.');
        }
      }
      
      // Mark that search has been performed
      setHasSearched(true);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      
      // Устанавливаем режим ошибки API
      setApiErrorMode(true);
      
      // If error occurs, check if we have cached results
      if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
        // If error occurred when changing pages, use current cached results
        setSearchResults(cachedResults[currentPage]);
      } else if (cachedResults[1] && cachedResults[1].length > 0) {
        // If no results for current page, return to first page
        setSearchResults(cachedResults[1]);
        setCurrentPage(1);
        toast.info('Возврат к первой странице из-за ошибки');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, lastSearchQuery, filters, cachedResults, currentPage, setSearchResults, setCurrentPage, 
      setTotalPages, setCachedResults, setOriginalQuery, setLastSearchQuery, setHasSearched, 
      setIsLoading, setApiErrorMode]);
  
  // Page change handler
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      // Increment page change counter to force a re-render
      setPageChangeCount(prev => prev + 1);
      // Set current page first
      setCurrentPage(page);
      // Then trigger a search with new page
      handleSearch(page);
    }
  };
  
  // Filter change handler
  const handleFilterChange = (newFilters: ProductFilters) => {
    setCurrentPage(1); // Reset to first page when filters change
    handleSearch(1, true);
  };

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange
  };
};
