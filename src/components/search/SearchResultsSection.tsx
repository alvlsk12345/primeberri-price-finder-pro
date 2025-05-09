import React, { useEffect, useCallback } from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/search";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { isSearchEngineLink, getProductLink } from "@/services/urlService";
import { Product } from "@/services/types";
import { toast } from "@/components/ui/sonner";
import { SortingMenu, SortOption } from "@/components/sorting/SortingMenu";

export const SearchResultsSection: React.FC = () => {
  const { 
    searchResults, 
    setSearchResults,
    selectedProduct, 
    currentPage, 
    totalPages, 
    handleProductSelect,
    handlePageChange,
    filters,
    handleFilterChange,
    originalQuery,
    apiErrorMode,
    sortOption,
    handleSortChange
  } = useSearch();

  // Улучшенная проверка ссылок при монтировании компонента
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      // Подсчитываем количество поисковых ссылок и заменяем их
      let searchLinksCount = 0;
      let fixedLinksCount = 0;
      
      // Создаем копию результатов для обработки
      const processedResults = [...searchResults];
      
      searchResults.forEach((product, index) => {
        // Проверка на поисковые ссылки
        if (product.link && isSearchEngineLink(product.link)) {
          searchLinksCount++;
          
          // Генерируем прямую ссылку на товар в магазине
          const directLink = getProductLink(product);
          
          if (directLink && !isSearchEngineLink(directLink)) {
            // Заменяем поисковую ссылку на прямую
            processedResults[index] = {
              ...product,
              link: directLink
            };
            fixedLinksCount++;
            console.log(`Ссылка исправлена для ${product.title}: ${directLink}`);
          }
        }
      });
      
      if (searchLinksCount > 0) {
        console.warn(`Внимание: ${searchLinksCount} из ${searchResults.length} ссылок ведут на поисковые системы`);
        console.log(`Исправлено ${fixedLinksCount} ссылок на прямые ссылки магазинов`);
        
        if (fixedLinksCount > 0) {
          // Уведомляем пользователя о замене ссылок
          toast.success(`Исправлено ${fixedLinksCount} ссылок на прямые ссылки магазинов`);
        }
      } else {
        console.log('Все ссылки на товары корректные');
      }
    }
  }, [searchResults]);
  
  // Function to apply sorting to products - defined in component
  const applySorting = useCallback((products: Product[], sort: SortOption): Product[] => {
    if (!products || products.length === 0) return products;
    
    const productsToSort = [...products];
    
    switch (sort) {
      case 'price-asc':
        return productsToSort.sort((a, b) => {
          const priceA = (a as any)._numericPrice || 0;
          const priceB = (b as any)._numericPrice || 0;
          return priceA - priceB;
        });
      case 'price-desc':
        return productsToSort.sort((a, b) => {
          const priceA = (a as any)._numericPrice || 0;
          const priceB = (b as any)._numericPrice || 0;
          return priceB - priceA;
        });
      case 'popularity-desc':
        return productsToSort.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
      default:
        return productsToSort;
    }
  }, []);

  // Handler for sort option changes
  const handleSortOptionChange = useCallback((option: SortOption) => {
    // First update the sort option in the state
    handleSortChange(option);
    
    // Then manually sort and update results
    if (searchResults && searchResults.length > 0) {
      const sortedResults = applySorting([...searchResults], option);
      setSearchResults(sortedResults);
    }
  }, [searchResults, applySorting, handleSortChange, setSearchResults]);

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {apiErrorMode && <SearchResultsAlert apiErrorMode={true} currentPage={currentPage} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <h2 className="text-xl font-semibold">
          Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}:
        </h2>
        <div className="flex items-center gap-2">
          <SortingMenu 
            currentSort={sortOption}
            onSortChange={handleSortOptionChange}
          />
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            results={searchResults}
          />
        </div>
      </div>
      <SearchResults 
        results={searchResults} 
        onSelect={handleProductSelect} 
        selectedProduct={selectedProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
