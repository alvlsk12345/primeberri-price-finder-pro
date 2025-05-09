
import React from 'react';
import { ProductFilters, Product } from "@/services/types";
import { FilterContainer } from './filter/FilterContainer';
import { PriceRangeFilter } from './filter/PriceRangeFilter';
import { BrandsFilter } from './filter/BrandsFilter';
import { SourcesFilter } from './filter/SourcesFilter';
import { RatingFilter } from './filter/RatingFilter';
import { CountryFilter } from './filter/CountryFilter';
import { useFilterPanel } from '@/hooks/useFilterPanel';

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
  const {
    localFilters,
    availableSources,
    availableBrands,
    priceRange,
    activeFiltersCount,
    handlePriceChange,
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange,
    applyFilters,
    resetFilters
  } = useFilterPanel(filters, onFilterChange, results);
  
  return (
    <FilterContainer 
      activeFiltersCount={activeFiltersCount}
      resetFilters={resetFilters}
      applyFilters={applyFilters}
    >
      <CountryFilter
        selectedCountries={localFilters.countries || []}
        onCountryChange={handleCountryChange}
      />
      
      <PriceRangeFilter 
        minPrice={localFilters.minPrice || priceRange[0]}
        maxPrice={localFilters.maxPrice || priceRange[1]}
        priceRange={priceRange}
        onPriceChange={handlePriceChange}
      />
      
      <BrandsFilter 
        availableBrands={availableBrands}
        selectedBrands={localFilters.brands || []}
        onBrandChange={handleBrandChange}
      />
      
      <SourcesFilter 
        availableSources={availableSources}
        selectedSources={localFilters.sources || []}
        onSourceChange={handleSourceChange}
      />
      
      <RatingFilter 
        rating={localFilters.rating || 0}
        onRatingChange={handleRatingChange}
      />
    </FilterContainer>
  );
};
