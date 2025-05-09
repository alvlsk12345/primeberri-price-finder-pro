
import { ProductFilters } from "@/services/types";

type UseFilterHandlersProps = {
  localFilters: ProductFilters;
  setLocalFilters: (filters: ProductFilters) => void;
  onFilterChange?: (filters: ProductFilters) => void;
};

export function useFilterHandlers({
  localFilters,
  setLocalFilters,
  onFilterChange
}: UseFilterHandlersProps) {
  // Вспомогательная функция для автоприменения фильтров
  const applyFilters = (newFilters: ProductFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Обработчик изменения ценового диапазона
  const handlePriceChange = (minPrice?: number, maxPrice?: number) => {
    const newFilters = { ...localFilters, minPrice, maxPrice };
    setLocalFilters(newFilters);
    applyFilters(newFilters); // Автоприменение
  };
  
  // Обработчик изменения брендов
  const handleBrandChange = (brands: string[]) => {
    const newFilters = { ...localFilters, brands };
    setLocalFilters(newFilters);
    applyFilters(newFilters); // Автоприменение
  };
  
  // Обработчик изменения источников
  const handleSourceChange = (sources: string[]) => {
    const newFilters = { ...localFilters, sources };
    setLocalFilters(newFilters);
    applyFilters(newFilters); // Автоприменение
  };
  
  // Обработчик изменения стран
  const handleCountryChange = (countries: string[]) => {
    const newFilters = { ...localFilters, countries };
    setLocalFilters(newFilters);
    applyFilters(newFilters); // Автоприменение
  };
  
  // Обработчик изменения рейтинга
  const handleRatingChange = (rating?: number) => {
    const newFilters = { ...localFilters, rating };
    setLocalFilters(newFilters);
    applyFilters(newFilters); // Автоприменение
  };
  
  return {
    handlePriceChange,
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange
  };
}
