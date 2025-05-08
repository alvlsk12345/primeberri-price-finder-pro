
import React from 'react';
import { Popover } from "@/components/ui/popover";
import { FilterTrigger } from './FilterTrigger';
import { FilterContent } from './FilterContent';

interface FilterContainerProps {
  activeFiltersCount: number;
  resetFilters: () => void;
  applyFilters: () => void;
  children: React.ReactNode;
}

export const FilterContainer: React.FC<FilterContainerProps> = ({
  activeFiltersCount,
  resetFilters,
  applyFilters,
  children
}) => {
  return (
    <div className="flex flex-col items-end">
      <Popover>
        <FilterTrigger activeFiltersCount={activeFiltersCount} />
        <FilterContent 
          resetFilters={resetFilters} 
          applyFilters={applyFilters}
        >
          {children}
        </FilterContent>
      </Popover>
    </div>
  );
};
