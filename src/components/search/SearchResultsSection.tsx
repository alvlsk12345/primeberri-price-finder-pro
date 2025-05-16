
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ProductListContainer } from "./ProductListContainer";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { ApiUsageInfo } from "./ApiUsageInfo";
import { FilterSection } from "./FilterSection";

export const SearchResultsSection: React.FC = () => {
  return (
    <SearchProvider>
      <SearchResultsContent />
    </SearchProvider>
  );
};

// Выделяем внутренний компонент, который использует хук useSearch
const SearchResultsContent: React.FC = () => {
  const { searchResults, hasSearched, apiInfo, lastSearchQuery, originalQuery } = useSearch();
  
  if (!hasSearched || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="search-results-section">
      <SearchResultsAlert />
      <div className="mb-4">
        <FilterSection />
      </div>
      <ProductListContainer />
      
      {apiInfo && Object.keys(apiInfo).length > 0 && (
        <ApiUsageInfo apiInfo={apiInfo} />
      )}
    </div>
  );
};
