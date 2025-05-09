
import React from 'react';
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/SearchContext";

export const FilterSection: React.FC = () => {
  const { 
    filters, 
    handleFilterChange,
    searchResults
  } = useSearch();
  
  return (
    <FilterPanel 
      filters={filters} 
      onFilterChange={handleFilterChange}
      results={searchResults}
    />
  );
};
