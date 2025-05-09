import { useState, useCallback } from 'react';
import { SearchContextType, FilterState, Product } from './SearchContext';
import { searchProductsViaZylalabs } from "@/services/api/zylalabsService";

export const useSearchHandlers = (context: SearchContextType) => {
  const handleSearch = useCallback(async (page: number = 1, resetPage: boolean = false) => {
    context.setIsLoading(true);
    context.setApiErrorMode(false);

    if (resetPage) {
      context.setCurrentPage(1);
      page = 1;
    }

    try {
      const searchParams = {
        query: context.searchQuery,
        page: page,
        countries: ['gb'],
        language: 'en',
        filters: context.filters,
        sort: context.sortOption
      };

      const results = await searchProductsViaZylalabs(searchParams);

      if (results && results.products) {
        context.setSearchResults(results.products);
        context.setTotalPages(results.totalPages || 1);
        context.setCurrentPage(page);
      } else {
        context.setSearchResults([]);
        context.setTotalPages(1);
        context.setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      context.setApiErrorMode(true);
      context.setSearchResults([]);
      context.setTotalPages(1);
      context.setCurrentPage(1);
    } finally {
      context.setIsLoading(false);
    }
  }, [context.searchQuery, context.filters, context.sortOption, context]);

  const handleProductSelect = useCallback((product: Product) => {
    console.log('Selected product:', product);
    context.setSelectedProduct(product);
  }, [context]);

  const handlePageChange = useCallback((newPage: number) => {
    console.log(`handlePageChange - Requesting page: ${newPage}`);
      handleSearch(newPage);
  }, [handleSearch]);

  const handleFilterChange = useCallback((filterName: string, value: boolean) => {
    console.log(`Filter change - Filter: ${filterName}, Value: ${value}`);
    const updatedFilters = { ...context.filters, [filterName]: value };
    context.setFilters(updatedFilters);
  }, [context.filters, context]);

  const handleSortChange = (sortOption: string) => {
    // Update the sort option in state
    context.setSortOption(sortOption);
    
    // Sort the results based on the selected option
    let sortedResults: Product[] = [];
    
    switch (sortOption) {
      case 'relevance':
        // Default sorting as returned by the API
        sortedResults = [...context.searchResults];
        break;
      case 'price_asc':
        sortedResults = [...context.searchResults].sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        sortedResults = [...context.searchResults].sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
          return priceB - priceA;
        });
        break;
      case 'popularity':
        sortedResults = [...context.searchResults].sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        sortedResults = [...context.searchResults];
        break;
    }
    
    // Direct assignment instead of using a setter function with previous state
    context.setSearchResults(sortedResults);
  };

  return {
    handleSearch,
    handleProductSelect,
    handlePageChange,
    handleFilterChange,
    handleSortChange
  };
};
