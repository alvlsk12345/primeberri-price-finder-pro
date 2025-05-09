
import React, { useState, useEffect } from 'react';
import { ProductFilters, Product } from "@/services/types";
import { FilterContainer } from './filter/FilterContainer';
import { PriceRangeFilter } from './filter/PriceRangeFilter';
import { BrandsFilter } from './filter/BrandsFilter';
import { SourcesFilter } from './filter/SourcesFilter';
import { RatingFilter } from './filter/RatingFilter';
import { CountryFilter } from './filter/CountryFilter';

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
  // Локальное состояние для фильтров перед применением
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  
  // Доступные источники и бренды для фильтрации
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  // Диапазон цен для фильтрации
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Количество активных фильтров
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Вычисляем уникальные источники и бренды из результатов
  useEffect(() => {
    if (!results || results.length === 0) return;
    
    // Собираем уникальные источники
    const sources = Array.from(new Set(results.map(product => product.source)))
      .filter(source => source);
    
    // Собираем уникальные бренды
    const brands = Array.from(new Set(results.map(product => product.brand)))
      .filter(brand => brand) as string[];
    
    // Вычисляем мин. и макс. цену
    let minPrice = Infinity;
    let maxPrice = 0;
    
    results.forEach(product => {
      if ((product as any)._numericPrice) {
        minPrice = Math.min(minPrice, (product as any)._numericPrice);
        maxPrice = Math.max(maxPrice, (product as any)._numericPrice);
      }
    });
    
    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === 0) maxPrice = 1000;
    
    // Округляем ценовые значения для удобства
    minPrice = Math.floor(minPrice);
    maxPrice = Math.ceil(maxPrice);
    
    setAvailableSources(sources);
    setAvailableBrands(brands);
    setPriceRange([minPrice, maxPrice]);
    
    // Сбрасываем локальные фильтры к текущим основным фильтрам
    setLocalFilters(filters);
  }, [results, filters]);
  
  // Подсчитываем количество активных фильтров
  useEffect(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.sources && filters.sources.length > 0) count++;
    if (filters.countries && filters.countries.length > 0) count++;
    if (filters.rating) count++;
    setActiveFiltersCount(count);
  }, [filters]);
  
  // Обработчик изменения слайдера цен
  const handlePriceChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));
  };
  
  // Обработчик изменения брендов
  const handleBrandChange = (brand: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentBrands = prev.brands || [];
      let newBrands;
      
      if (checked) {
        newBrands = [...currentBrands, brand];
      } else {
        newBrands = currentBrands.filter(b => b !== brand);
      }
      
      return {
        ...prev,
        brands: newBrands.length > 0 ? newBrands : undefined
      };
    });
  };
  
  // Обработчик изменения источников
  const handleSourceChange = (source: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentSources = prev.sources || [];
      let newSources;
      
      if (checked) {
        newSources = [...currentSources, source];
      } else {
        newSources = currentSources.filter(s => s !== source);
      }
      
      return {
        ...prev,
        sources: newSources.length > 0 ? newSources : undefined
      };
    });
  };
  
  // Обработчик изменения стран
  const handleCountryChange = (country: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentCountries = prev.countries || [];
      let newCountries;
      
      if (checked) {
        newCountries = [...currentCountries, country];
      } else {
        newCountries = currentCountries.filter(c => c !== country);
      }
      
      return {
        ...prev,
        countries: newCountries.length > 0 ? newCountries : undefined
      };
    });
  };
  
  // Обработчик изменения рейтинга
  const handleRatingChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      rating: values[0]
    }));
  };
  
  // Применение фильтров
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Сброс всех фильтров
  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  
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
