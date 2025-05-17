
import { useState, useEffect } from 'react';
import { Product, ProductFilters, SortOption } from "@/services/types";

type UseLocalFilteringProps = {
  allResults: Product[];
  filters: ProductFilters;
  setSearchResults: (results: Product[]) => void;
};

export function useLocalFiltering({
  allResults,
  filters,
  setSearchResults
}: UseLocalFilteringProps) {
  
  // Отслеживаем изменение фильтров или всех результатов
  useEffect(() => {
    if (allResults && allResults.length > 0) {
      const filteredResults = applyFiltersLocally(allResults, filters);
      setSearchResults(filteredResults);
      
      console.log('Применены локальные фильтры:', { 
        totalResults: allResults.length, 
        filteredResults: filteredResults.length,
        appliedFilters: JSON.stringify(filters)
      });
    }
  }, [filters, allResults, setSearchResults]);
  
  // Функция для локального применения фильтров к имеющимся результатам
  const applyFiltersLocally = (products: Product[], currentFilters?: ProductFilters): Product[] => {
    if (!currentFilters || Object.keys(currentFilters).length === 0) {
      return products;
    }
    
    let filteredProducts = [...products];
    
    // Фильтрация по цене
    if (currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        const productPrice = typeof product._numericPrice === 'number' 
          ? product._numericPrice 
          : parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
        
        if (currentFilters.minPrice !== undefined && productPrice < currentFilters.minPrice) {
          return false;
        }
        if (currentFilters.maxPrice !== undefined && productPrice > currentFilters.maxPrice) {
          return false;
        }
        return true;
      });
    }
    
    // Фильтрация по рейтингу
    if (currentFilters.rating !== undefined && currentFilters.rating > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const rating = typeof product.rating === 'number' ? product.rating : 0;
        return rating >= currentFilters.rating;
      });
    }
    
    // Фильтрация по брендам
    if (currentFilters.brands && currentFilters.brands.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        return currentFilters.brands!.includes(product.brand || '');
      });
    }
    
    // Фильтрация по источникам
    if (currentFilters.sources && currentFilters.sources.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        // Проверяем, содержит ли источник товара один из выбранных источников
        return currentFilters.sources!.some(source => 
          product.source.toLowerCase().includes(source.toLowerCase())
        );
      });
    }
    
    // Фильтрация по странам
    if (currentFilters.countries && currentFilters.countries.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        return currentFilters.countries!.includes(product.country || '');
      });
    }
    
    // Применение сортировки
    if (currentFilters.sortBy) {
      switch(currentFilters.sortBy as SortOption) {
        case 'price_asc':
        case 'price-asc':
          filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceA - priceB;
          });
          break;
        case 'price_desc':
        case 'price-desc':
          filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceB - priceA;
          });
          break;
        case 'rating_desc':
        case 'rating-desc':
          filteredProducts.sort((a, b) => {
            const ratingA = typeof a.rating === 'number' ? a.rating : 0;
            const ratingB = typeof b.rating === 'number' ? b.rating : 0;
            return ratingB - ratingA;
          });
          break;
      }
    }
    
    return filteredProducts;
  };
  
  return {
    applyFiltersLocally
  };
}
