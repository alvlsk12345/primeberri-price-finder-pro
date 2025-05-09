
import { ReactNode } from 'react';

interface UseFilterContainerProps {
  activeFiltersCount: number;
  resetFilters: () => void;
  applyFilters: () => void;
}

export function useFilterContainer({
  activeFiltersCount,
  resetFilters,
  applyFilters
}: UseFilterContainerProps) {
  return {
    activeFiltersCount,
    resetFilters,
    applyFilters
  };
}
