
import { useState, useEffect, useCallback } from 'react';
import { ProductFilters } from "@/services/types";

// Параметры для хука обработки фильтров
type FilterHandlersProps = {
  localFilters: ProductFilters;
  setLocalFilters: (filters: ProductFilters) => void;
  onFilterChange: (filters: ProductFilters) => void;
  autoApply?: boolean; // Новый параметр для автоматического применения фильтров
};

// Хук для обработки изменений фильтров
export function useFilterHandlers({
  localFilters,
  setLocalFilters,
  onFilterChange,
  autoApply = true // По умолчанию включаем автоприменение
}: FilterHandlersProps) {
  // Задержка для применения фильтров (предотвращает слишком частые запросы)
  const [applyTimeout, setApplyTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Функция для отложенного применения фильтров
  const applyFiltersWithDelay = useCallback(() => {
    if (applyTimeout) {
      clearTimeout(applyTimeout);
    }
    
    // Применяем фильтры с небольшой задержкой для предотвращения множественных запросов
    const timeout = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    
    setApplyTimeout(timeout);
  }, [localFilters, onFilterChange, applyTimeout]);
  
  // Очистка таймаута при размонтировании компонента
  useEffect(() => {
    return () => {
      if (applyTimeout) {
        clearTimeout(applyTimeout);
      }
    };
  }, [applyTimeout]);
  
  // Обработчик изменения минимальной и максимальной цены
  const handlePriceChange = (min: number, max: number) => {
    setLocalFilters({
      ...localFilters,
      minPrice: min,
      maxPrice: max
    });
    
    if (autoApply) applyFiltersWithDelay();
  };
  
  // Обработчик изменения брендов
  const handleBrandChange = (brands: string[]) => {
    setLocalFilters({
      ...localFilters,
      brands
    });
    
    if (autoApply) applyFiltersWithDelay();
  };
  
  // Обработчик изменения источников (магазинов)
  const handleSourceChange = (sources: string[]) => {
    setLocalFilters({
      ...localFilters,
      sources
    });
    
    if (autoApply) applyFiltersWithDelay();
  };
  
  // Обработчик изменения стран
  const handleCountryChange = (countries: string[]) => {
    setLocalFilters({
      ...localFilters,
      countries
    });
    
    if (autoApply) applyFiltersWithDelay();
  };
  
  // Обработчик изменения рейтинга
  const handleRatingChange = (rating: number) => {
    setLocalFilters({
      ...localFilters,
      rating
    });
    
    if (autoApply) applyFiltersWithDelay();
  };

  // Обработчик изменения сортировки
  const handleSortChange = (sortBy: string) => {
    setLocalFilters({
      ...localFilters,
      sortBy
    });
    
    if (autoApply) applyFiltersWithDelay();
  };
  
  return {
    handlePriceChange,
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange,
    handleSortChange,
    applyFilters: () => onFilterChange(localFilters)
  };
}
