
import React from 'react';
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/SearchContext";

export const FilterSection: React.FC = () => {
  const { 
    filters, 
    handleFilterChange,
    searchResults
  } = useSearch();
  
  // Для немедленного применения фильтров передаем изменения напрямую
  const handleFilterUpdate = (newFilters) => {
    handleFilterChange(newFilters);
  };
  
  return (
    <FilterPanel 
      filters={filters} 
      onFilterChange={handleFilterUpdate}
      results={searchResults}
    />
  );
};
