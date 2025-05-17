
import React from 'react';
import { Popover } from "@/components/ui/popover";
import { FilterTrigger } from './FilterTrigger';
import { FilterContent } from './FilterContent';
import { useFilterContainer } from '@/hooks/useFilterContainer';

interface FilterContainerProps {
  activeFiltersCount: number;
  resetFilters: () => void;
  applyFilters?: () => void; // Делаем необязательным
  autoApply?: boolean; // Добавляем autoApply
  children: React.ReactNode;
}

export const FilterContainer: React.FC<FilterContainerProps> = (props) => {
  const { activeFiltersCount, resetFilters, applyFilters, autoApply = true } = props;
  
  return (
    <div className="flex flex-col items-end">
      <Popover>
        <FilterTrigger activeFiltersCount={activeFiltersCount} />
        <FilterContent 
          resetFilters={resetFilters} 
          applyFilters={applyFilters}
          autoApply={autoApply}
        >
          {props.children}
        </FilterContent>
      </Popover>
    </div>
  );
};
