
import React, { useEffect } from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/search";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { isSearchEngineLink } from "@/services/urlService";

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
    apiErrorMode
  } = useSearch();

  // Добавляем проверку ссылок при монтировании компонента
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      // Подсчитываем количество поисковых ссылок
      let searchLinksCount = 0;
      
      searchResults.forEach(product => {
        // Проверка на поисковые ссылки
        if (product.link && isSearchEngineLink(product.link)) {
          console.warn(`Обнаружена поисковая ссылка:`, product.link);
          searchLinksCount++;
        }
      });
      
      if (searchLinksCount > 0) {
        console.warn(`Внимание: ${searchLinksCount} из ${searchResults.length} ссылок ведут на поисковые системы`);
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
      {apiErrorMode && <SearchResultsAlert apiErrorMode={true} currentPage={currentPage} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <h2 className="text-xl font-semibold">
          Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}:
        </h2>
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          results={searchResults}
        />
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
