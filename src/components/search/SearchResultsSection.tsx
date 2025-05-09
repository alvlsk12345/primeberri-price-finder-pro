
import React, { useEffect } from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/search";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { isSearchEngineLink, getProductLink } from "@/services/urlService";
import { Product } from "@/services/types";
import { toast } from "@/components/ui/sonner";

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
