
import React from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterSection } from "@/components/search/FilterSection";
import { useSearch } from "@/contexts/SearchContext";
import { ApiUsageInfo } from "@/components/search/ApiUsageInfo";
import { SortButtons } from "../filter/SortButtons";
import { SortOption } from "@/services/types";
import { Languages, Bug, Search } from "lucide-react";

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
    handleFilterChange,
    lastSearchQuery
  } = useSearch();
  
  if (searchResults.length === 0) {
    return null;
  }

  // Обновленный обработчик сортировки - сразу применяет изменения
  const handleSortChange = (sortBy: SortOption) => {
    // Обновляем текущие фильтры с новым методом сортировки и сразу применяем
    handleFilterChange({
      ...filters,
      sortBy
    });
  };

  // Проверяем, был ли запрос переведен (если оригинальный запрос на русском)
  const wasTranslated = originalQuery && originalQuery.match(/[\u0400-\u04FF]/) && lastSearchQuery && lastSearchQuery !== originalQuery;
  
  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <SortButtons sortBy={filters.sortBy || "" as SortOption} onSortChange={handleSortChange} />
          <FilterSection />
        </div>
        
        <div className="flex flex-col gap-2">
          {wasTranslated ? (
            <div className="flex items-center text-sm text-blue-600 gap-1 bg-blue-50 p-2 rounded">
              <Languages size={16} />
              <span>Запрос переведен для поиска в зарубежных магазинах</span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-green-600 gap-1 bg-green-50 p-2 rounded">
              <Search size={16} />
              <span>Поиск без перевода запроса</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-amber-700 gap-1 bg-amber-50 p-2 rounded">
            <Bug size={16} />
            <span>Режим отладки: параметры запроса - "{lastSearchQuery || originalQuery}" стр.{currentPage}</span>
          </div>
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
