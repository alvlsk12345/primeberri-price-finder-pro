
import { ProductFilters } from "@/services/types";

interface FilterHandlersProps {
  localFilters: ProductFilters;
  setLocalFilters: (filters: ProductFilters) => void;
}

export function useFilterHandlers({ localFilters, setLocalFilters }: FilterHandlersProps) {
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
  
  return {
    handlePriceChange,
    handleBrandChange,
    handleSourceChange,
    handleCountryChange,
    handleRatingChange
  };
}
