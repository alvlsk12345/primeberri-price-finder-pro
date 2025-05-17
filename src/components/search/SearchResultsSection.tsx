
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { ProductListContainer } from "./ProductListContainer";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { ApiUsageInfo } from "./ApiUsageInfo";
import { FilterSection } from "./FilterSection";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";
import { toast } from "sonner";

export const SearchResultsSection: React.FC = () => {
  const { 
    searchResults, 
    hasSearched, 
    apiInfo, 
    lastSearchQuery, 
    originalQuery, 
    selectedProduct, 
    currentPage, 
    totalPages, 
    handleProductSelect, 
    handlePageChange,
    handleSearch
  } = useSearch();
  
  // Функция для очистки кеша и повторного поиска
  const handleClearCacheAndSearch = () => {
    const clearedItems = clearApiCache();
    toast.success(`Кеш API очищен: удалено ${clearedItems} элементов`, { duration: 3000 });
    
    // Выполняем новый поиск с текущими параметрами и принудительным флагом
    if (lastSearchQuery) {
      handleSearch(currentPage, true);
    }
  };
  
  // Если поиск не выполнялся или нет результатов, не отображаем секцию
  if (!hasSearched || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="search-results-section">
      <SearchResultsAlert currentPage={currentPage} />
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium">Результаты для «{originalQuery || lastSearchQuery}»</h2>
          
          {apiInfo && apiInfo.forceNewSearch === "true" && (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
              Новый поиск
            </Badge>
          )}
          
          {apiInfo && apiInfo.isDemo === "true" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              Демо-режим
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearCacheAndSearch}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Обновить результаты
        </Button>
      </div>
      
      <div className="mb-4">
        <FilterSection />
      </div>
      
      <ProductListContainer 
        products={searchResults}
        selectedProduct={selectedProduct}
        onSelect={handleProductSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isDemo={apiInfo && apiInfo.isDemo === "true"}
      />
      
      {apiInfo && Object.keys(apiInfo).length > 0 && (
        <ApiUsageInfo apiInfo={apiInfo} />
      )}
    </div>
  );
};
