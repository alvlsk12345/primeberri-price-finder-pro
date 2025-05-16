
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { ProductListContainer } from "./ProductListContainer";
import { SearchResultsAlert } from "./SearchResultsAlert";
import { ApiUsageInfo } from "./ApiUsageInfo";
import { FilterSection } from "./FilterSection";

export const SearchResultsSection: React.FC = () => {
  const { searchResults, hasSearched, apiInfo, lastSearchQuery, originalQuery, selectedProduct, currentPage, totalPages, handleProductSelect, handlePageChange } = useSearch();
  
  // Если поиск не выполнялся или нет результатов, не отображаем секцию
  if (!hasSearched || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="search-results-section">
      <SearchResultsAlert currentPage={currentPage} />
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
        isDemo={apiInfo && apiInfo.isDemo === true}
      />
      
      {apiInfo && Object.keys(apiInfo).length > 0 && (
        <ApiUsageInfo apiInfo={apiInfo} />
      )}
    </div>
  );
};
