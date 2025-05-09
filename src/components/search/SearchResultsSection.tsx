
import React from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterSection } from "@/components/search/FilterSection";
import { useSearch } from "@/contexts/SearchContext";
import { ApiUsageInfo } from "@/components/search/ApiUsageInfo";
import { SortButtons } from "../filter/SortButtons";
import { SortOption } from "@/services/types";
import { Languages } from "lucide-react";

export const SearchResultsSection: React.FC = () => {
  const { 
    searchResults, 
    selectedProduct, 
    currentPage, 
    totalPages, 
    handleProductSelect,
    handlePageChange,
    originalQuery,
    isUsingDemoData,
    apiInfo,
    filters,
    handleFilterChange
  } = useSearch();

  if (searchResults.length === 0) {
    return null;
  }

  // Обновленный обработчик сортировки - сразу применяет изменения
  const handleSortChange = (sortBy: SortOption) => {
    // Обновляем текущие фильтры с новым методом сортировки и сразу применяем
    handleFilterChange({ ...filters, sortBy });
  };

  // Проверяем, был ли запрос переведен (если оригинальный запрос на русском)
  const wasTranslated = originalQuery && originalQuery.match(/[\u0400-\u04FF]/) ? true : false;

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <h2 className="text-xl font-semibold">
          {isUsingDemoData ? '[ДЕМО] ' : ''}
          Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}
          {wasTranslated && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center inline-flex">
              <Languages size={14} className="mr-1" /> Запрос переведен
            </span>
          )}:
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <SortButtons 
            sortBy={filters.sortBy || "" as SortOption}
            onSortChange={handleSortChange}
          />
          <FilterSection />
        </div>
      </div>
      
      {apiInfo && Object.keys(apiInfo).length > 0 && <ApiUsageInfo />}
      
      <SearchResults 
        results={searchResults} 
        onSelect={handleProductSelect} 
        selectedProduct={selectedProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isDemo={isUsingDemoData}
      />
    </div>
  );
};
