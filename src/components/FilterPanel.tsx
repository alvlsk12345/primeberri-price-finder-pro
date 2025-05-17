
import React from 'react';
import { ProductFilters, Product } from "@/services/types";
import { FilterContainer } from './filter/FilterContainer';
import { CountryFilter } from './filter/CountryFilter';
import { SourcesFilter } from './filter/SourcesFilter';
import { SortButtons } from './filter/SortButtons';
import { useFilterPanel } from '@/hooks/useFilterPanel';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';

interface FilterPanelProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  results: Product[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange,
  results
}) => {
  // Используем хуки для разделения логики
  const {
    localFilters,
    setLocalFilters,
    availableSources,
    availableBrands,
    priceRange,
    activeFiltersCount
  } = useFilterPanel(filters, results);
  
  // Получаем обработчики событий из хука, с autoApply = true
  const {
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange,
    handleSortChange
  } = useFilterHandlers({ 
    localFilters, 
    setLocalFilters, 
    onFilterChange, // Сразу передаем для автоприменения
    autoApply: true
  });
  
  // Сброс всех фильтров
  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Адаптеры для обработчиков
  const handleCountryChangeAdapter = (country: string, checked: boolean) => {
    const updatedCountries = [...(localFilters.countries || [])];
    if (checked) {
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
      }
    } else {
      const index = updatedCountries.indexOf(country);
      if (index !== -1) {
        updatedCountries.splice(index, 1);
      }
    }
    handleCountryChange(updatedCountries);
  };

  const handleSourceChangeAdapter = (source: string, checked: boolean) => {
    const updatedSources = [...(localFilters.sources || [])];
    if (checked) {
      if (!updatedSources.includes(source)) {
        updatedSources.push(source);
      }
    } else {
      const index = updatedSources.indexOf(source);
      if (index !== -1) {
        updatedSources.splice(index, 1);
      }
    }
    handleSourceChange(updatedSources);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SortButtons 
          sortBy={filters.sortBy || "price-asc"} 
          onSortChange={(value) => handleSortChange(value)} 
        />
      </div>
      
      <FilterContainer 
        activeFiltersCount={activeFiltersCount}
        resetFilters={resetFilters}
        autoApply={true}
      >
        <CountryFilter
          selectedCountries={localFilters.countries || []}
          onCountryChange={handleCountryChangeAdapter}
        />
        
        <SourcesFilter 
          availableSources={availableSources}
          selectedSources={localFilters.sources || []}
          onSourceChange={handleSourceChangeAdapter}
        />
      </FilterContainer>
    </div>
  );
};
