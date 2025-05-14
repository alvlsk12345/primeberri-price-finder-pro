
import React, { useEffect } from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterSection } from "@/components/search/FilterSection";
import { useSearch } from "@/contexts/SearchContext";
import { ApiUsageInfo } from "@/components/search/ApiUsageInfo";
import { SearchResultsAlert } from "@/components/search/SearchResultsAlert";
import { SortButtons } from "../filter/SortButtons";
import { SortOption } from "@/services/types";
import { Languages, Filter } from "lucide-react";
import { isOnSettingsPage } from "@/utils/navigation";

export const SearchResultsSection: React.FC = () => {
  // Проверяем, находимся ли мы на странице настроек
  if (isOnSettingsPage()) {
    console.log('[SearchResultsSection] Компонент на странице настроек - не отображаем');
    return null;
  }

  try {
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
      lastSearchQuery,
      allSearchResults
    } = useSearch();

    // Логируем информацию о количестве результатов для отладки
    useEffect(() => {
      console.log(`SearchResultsSection: Всего результатов: ${allSearchResults?.length || 0}, отфильтровано: ${searchResults?.length || 0}`);
    }, [allSearchResults, searchResults]);

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

    // Проверяем, применяются ли фильтры
    const hasActiveFilters = filters && Object.keys(filters).filter(k => k !== 'sortBy' && filters[k] && (Array.isArray(filters[k]) ? filters[k].length > 0 : true)).length > 0;

    return <div className="mt-6 search-results-section">
        {/* Добавляем алерт для демо-режима */}
        <SearchResultsAlert currentPage={currentPage} />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <SortButtons sortBy={filters.sortBy || "" as SortOption} onSortChange={handleSortChange} />
            <FilterSection />
          </div>
          
          <div className="flex flex-col gap-2">
            {wasTranslated ? <div className="flex items-center text-sm text-blue-600 gap-1 bg-blue-50 p-2 rounded">
                <Languages size={16} />
                <span>Запрос переведен для поиска в зарубежных магазинах</span>
              </div> : null}
            
            {hasActiveFilters && <div className="flex items-center text-sm text-purple-700 gap-1 bg-purple-50 p-2 rounded">
                <Filter size={16} />
                <span>Применена локальная фильтрация: показано {searchResults.length} из {allSearchResults.length}</span>
              </div>}
          </div>
        </div>
        
        {apiInfo && Object.keys(apiInfo).length > 0 && <ApiUsageInfo />}
        
        <SearchResults results={searchResults} onSelect={handleProductSelect} selectedProduct={selectedProduct} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isDemo={isUsingDemoData} />
      </div>;
  } catch (error) {
    console.error('[SearchResultsSection] Ошибка при использовании useSearch:', error);
    return null;
  }
};
