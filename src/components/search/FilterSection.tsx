
import React from 'react';
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/SearchContext";

export const FilterSection: React.FC = () => {
  const { 
    filters, 
    handleFilterChange,
    searchResults
  } = useSearch();
  
  // Для немедленного применения фильтров передаем изменения через новый обработчик
  const handleFilterUpdate = (filterName: string, value: any) => {
    handleFilterChange(filterName, value);
  };
  
  return (
    <FilterPanel 
      filters={filters} 
      onFilterChange={handleFilterUpdate}
      results={searchResults}
    />
  );
};
