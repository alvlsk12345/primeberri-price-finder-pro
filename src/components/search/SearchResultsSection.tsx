
import React from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterSection } from "@/components/search/FilterSection";
import { useSearch } from "@/contexts/SearchContext";
import { ApiUsageInfo } from "@/components/search/ApiUsageInfo";
import { SortButtons } from "../filter/SortButtons";

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

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <h2 className="text-xl font-semibold">
          {isUsingDemoData ? '[ДЕМО] ' : ''}
          Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}:
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <SortButtons 
            sortBy={filters.sortBy || ""}
            onSortChange={(sortBy) => handleFilterChange({ ...filters, sortBy })}
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
