
import React from 'react';
import { ProductFilters, Product } from "@/services/types";
import { FilterContainer } from './filter/FilterContainer';
import { PriceRangeFilter } from './filter/PriceRangeFilter';
import { BrandsFilter } from './filter/BrandsFilter';
import { SourcesFilter } from './filter/SourcesFilter';
import { RatingFilter } from './filter/RatingFilter';
import { CountryFilter } from './filter/CountryFilter';
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
  
  // Получаем обработчики событий из хука, предопределяя autoApply = true
  const {
    handlePriceChange,
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange
  } = useFilterHandlers({ 
    localFilters, 
    setLocalFilters, 
    onFilterChange // Передаем onFilterChange для автоприменения
  });
  
  // Применение фильтров - будет вызываться и автоматически через useFilterHandlers
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Сброс всех фильтров
  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Адаптеры для обработчиков, которые преобразуют типы параметров
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

  const handlePriceChangeAdapter = (values: number[]) => {
    if (values.length === 2) {
      handlePriceChange(values[0], values[1]);
    }
  };

  const handleBrandChangeAdapter = (brand: string, checked: boolean) => {
    const updatedBrands = [...(localFilters.brands || [])];
    if (checked) {
      if (!updatedBrands.includes(brand)) {
        updatedBrands.push(brand);
      }
    } else {
      const index = updatedBrands.indexOf(brand);
      if (index !== -1) {
        updatedBrands.splice(index, 1);
      }
    }
    handleBrandChange(updatedBrands);
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

  const handleRatingChangeAdapter = (values: number[]) => {
    if (values.length > 0) {
      handleRatingChange(values[0]);
    }
  };
  
  return (
    <FilterContainer 
      activeFiltersCount={activeFiltersCount}
      resetFilters={resetFilters}
      applyFilters={applyFilters}
    >
      <CountryFilter
        selectedCountries={localFilters.countries || []}
        onCountryChange={handleCountryChangeAdapter}
      />
      
      <PriceRangeFilter 
        minPrice={localFilters.minPrice || priceRange[0]}
        maxPrice={localFilters.maxPrice || priceRange[1]}
        priceRange={priceRange}
        onPriceChange={handlePriceChangeAdapter}
      />
      
      <BrandsFilter 
        availableBrands={availableBrands}
        selectedBrands={localFilters.brands || []}
        onBrandChange={handleBrandChangeAdapter}
      />
      
      <SourcesFilter 
        availableSources={availableSources}
        selectedSources={localFilters.sources || []}
        onSourceChange={handleSourceChangeAdapter}
      />
      
      <RatingFilter 
        rating={localFilters.rating || 0}
        onRatingChange={handleRatingChangeAdapter}
      />
    </FilterContainer>
  );
};
