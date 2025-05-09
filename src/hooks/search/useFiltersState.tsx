
import { useState } from 'react';
import { ProductFilters } from "@/services/types";
import { EUROPEAN_COUNTRIES } from "@/components/filter/CountryFilter";

export function useFiltersState() {
  const [filters, setFilters] = useState<ProductFilters>({});

  // Helper function to get countries for search - either from filters or all
  const getSearchCountries = () => {
    return filters.countries && filters.countries.length > 0 
      ? filters.countries
      : EUROPEAN_COUNTRIES.map(country => country.code);
  };
  
  return {
    filters,
    setFilters,
    getSearchCountries,
  };
}
