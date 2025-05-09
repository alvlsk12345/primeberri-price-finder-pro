
import { Product, ProductFilters } from "@/services/types";

export function useSearchFilterProcessor() {
  
  // Функция применения сортировки и фильтрации к результатам поиска
  const applyFiltersAndSorting = (products: Product[], filters?: ProductFilters): Product[] => {
    if (!filters) {
      return products;
    }
    
    let filteredProducts = [...products];
    
    // Применяем фильтры к продуктам
    if (filters) {
      // Фильтр по цене
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => {
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
      
      // Фильтр по рейтингу
      if (filters.rating !== undefined && filters.rating > 0) {
        filteredProducts = filteredProducts.filter(product => {
          const rating = typeof product.rating === 'number' ? product.rating : 0;
          return rating >= filters.rating;
        });
      }
    }
    
    // Применяем сортировку
    if (filters && filters.sortBy) {
      switch(filters.sortBy) {
        case 'price_asc':
          filteredProducts = filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          filteredProducts = filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceB - priceA;
          });
          break;
        case 'rating_desc':
          filteredProducts = filteredProducts.sort((a, b) => {
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
    applyFiltersAndSorting
  };
}
