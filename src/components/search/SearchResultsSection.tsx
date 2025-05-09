
import React, { useEffect } from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/search";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { isSearchEngineLink, getProductLink } from "@/services/url";
import { Product } from "@/services/types";
import { toast } from "@/components/ui/sonner";
import { SortingMenu } from "@/components/sorting/SortingMenu";

export const SearchResultsSection: React.FC = () => {
  const { 
    searchResults, 
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
      
      // Проверяем ссылки каждого результата
      searchResults.forEach((product) => {
        if (product.link && isSearchEngineLink(product.link)) {
          searchLinksCount++;
        }
      });
      
      if (searchLinksCount > 0) {
        console.warn(`Внимание: ${searchLinksCount} из ${searchResults.length} ссылок ведут на поисковые системы`);
        
        // Показываем уведомление о поисковых ссылках
        if (searchLinksCount === searchResults.length) {
          toast.warning('Все ссылки на товары являются поисковыми. Рекомендуем посетить сайт магазина.');
        }
      } else {
        console.log('Все ссылки на товары корректные');
      }
    }
  }, [searchResults]);

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {apiErrorMode && 
        <div className="mb-4">
          <SearchResultsAlert 
            apiErrorMode={true} 
            currentPage={currentPage} 
          />
        </div>
      }
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <h2 className="text-xl font-semibold">
          Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}:
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <SortingMenu 
            currentSort={sortOption}
            onSortChange={handleSortChange}
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
