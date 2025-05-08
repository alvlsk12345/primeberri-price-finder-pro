
import React from 'react';
import { PopoverContent } from "@/components/ui/popover";
import { FilterActions } from './FilterActions';

interface FilterContentProps {
  resetFilters: () => void;
  applyFilters: () => void;
  children: React.ReactNode;
}

export const FilterContent: React.FC<FilterContentProps> = ({
  resetFilters,
  applyFilters,
  children
}) => {
  return (
    <PopoverContent className="w-80">
      <div className="space-y-4">
        {children}
        
        <FilterActions 
          resetFilters={resetFilters}
          applyFilters={applyFilters}
        />
      </div>
    </PopoverContent>
  );
};
