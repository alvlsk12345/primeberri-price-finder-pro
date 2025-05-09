
import React from 'react';
import { SearchResults } from "@/components/SearchResults";
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/SearchContext";

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
    isUsingDemoData
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
        isDemo={isUsingDemoData}
      />
    </div>
  );
};
