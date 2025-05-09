
import { useState, useEffect } from 'react';
import { ProductFilters, Product } from "@/services/types";

export function useFilterPanel(filters: ProductFilters, results: Product[]) {
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
  
  return {
    localFilters,
    setLocalFilters,
    availableSources,
    availableBrands,
    priceRange,
    activeFiltersCount
  };
}
