
import React from 'react';
import { FilterPanel } from "@/components/FilterPanel";
import { useSearch } from "@/contexts/SearchContext";
import { ProductFilters } from "@/services/types";

export const FilterSection: React.FC = () => {
  const { 
    filters, 
    handleFilterChange,
    searchResults
  } = useSearch();
  
  // Создаем адаптер для передачи в FilterPanel, который ожидает функцию с одним аргументом
  const handleFilterUpdate = (updatedFilters: ProductFilters) => {
    handleFilterChange(updatedFilters);
  };
  
  return (
    <FilterPanel 
      filters={filters} 
      onFilterChange={handleFilterUpdate}
      results={searchResults}
    />
  );
};
