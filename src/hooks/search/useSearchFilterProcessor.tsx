
import { Product, ProductFilters } from "@/services/types";

export function useSearchFilterProcessor() {
  
  // Функция применения сортировки и фильтрации к результатам поиска
  const applyFiltersAndSorting = (products: Product[], filters?: ProductFilters): Product[] => {
    if (!filters || Object.keys(filters).length === 0) {
      console.log("Фильтры не заданы, возвращаем все результаты");
      return products;
    }
    
    let filteredProducts = [...products];
    let filterApplied = false;
    
    console.log("Начало применения фильтров. Исходное количество товаров:", products.length);
    
    // Применяем фильтры к продуктам
    if (filters) {
      // Фильтр по цене
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => {
          // Используем _numericPrice если оно есть, иначе извлекаем число из строки
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
        filterApplied = true;
        console.log(`Применен фильтр по цене: ${beforeCount} -> ${filteredProducts.length} товаров`);
      }
      
      // Фильтр по рейтингу
      if (filters.rating !== undefined && filters.rating > 0) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => {
          const rating = typeof product.rating === 'number' ? product.rating : 0;
          return rating >= filters.rating;
        });
        filterApplied = true;
        console.log(`Применен фильтр по рейтингу: ${beforeCount} -> ${filteredProducts.length} товаров`);
      }
      
      // Фильтр по бренду
      if (filters.brands && filters.brands.length > 0) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => {
          return filters.brands!.includes(product.brand || '');
        });
        filterApplied = true;
        console.log(`Применен фильтр по брендам: ${beforeCount} -> ${filteredProducts.length} товаров`);
      }
      
      // Фильтр по источнику
      if (filters.sources && filters.sources.length > 0) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => {
          return filters.sources!.some(source => 
            product.source.toLowerCase().includes(source.toLowerCase())
          );
        });
        filterApplied = true;
        console.log(`Применен фильтр по источникам: ${beforeCount} -> ${filteredProducts.length} товаров`);
      }
      
      // Фильтр по странам
      if (filters.countries && filters.countries.length > 0) {
        const beforeCount = filteredProducts.length;
        filteredProducts = filteredProducts.filter(product => {
          return filters.countries!.includes(product.country || '');
        });
        filterApplied = true;
        console.log(`Применен фильтр по странам: ${beforeCount} -> ${filteredProducts.length} товаров`);
      }
    }
    
    // Применяем сортировку
    if (filters && filters.sortBy) {
      switch(filters.sortBy) {
        case 'price_asc':
        case 'price-asc':
          console.log("Применяем сортировку по возрастанию цены");
          filteredProducts = filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceA - priceB;
          });
          filterApplied = true;
          break;
        case 'price_desc':
        case 'price-desc':
          console.log("Применяем сортировку по убыванию цены");
          filteredProducts = filteredProducts.sort((a, b) => {
            const priceA = typeof a._numericPrice === 'number' ? a._numericPrice : parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = typeof b._numericPrice === 'number' ? b._numericPrice : parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceB - priceA;
          });
          filterApplied = true;
          break;
        case 'rating_desc':
        case 'rating-desc':
          console.log("Применяем сортировку по рейтингу");
          filteredProducts = filteredProducts.sort((a, b) => {
            const ratingA = typeof a.rating === 'number' ? a.rating : 0;
            const ratingB = typeof b.rating === 'number' ? b.rating : 0;
            return ratingB - ratingA;
          });
          filterApplied = true;
          break;
      }
    }
    
    if (!filterApplied) {
      console.log("Фильтры указаны, но не применены к данным");
    } else {
      console.log(`После применения всех фильтров осталось ${filteredProducts.length} товаров`);
    }
    
    return filteredProducts;
  };
  
  return {
    applyFiltersAndSorting
  };
}
