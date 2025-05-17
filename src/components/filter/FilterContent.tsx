
import React from 'react';
import { PopoverContent } from "@/components/ui/popover";
import { FilterActions } from './FilterActions';

interface FilterContentProps {
  resetFilters: () => void;
  applyFilters?: () => void; // Делаем необязательным
  children: React.ReactNode;
  autoApply?: boolean; // Добавляем опциональное свойство autoApply
}

export const FilterContent: React.FC<FilterContentProps> = ({
  resetFilters,
  applyFilters,
  children,
  autoApply = true // По умолчанию включено автоприменение
}) => {
  return (
    <PopoverContent className="w-80">
      <div className="space-y-4">
        {children}
        
        <FilterActions 
          resetFilters={resetFilters}
          applyFilters={applyFilters}
          autoApply={autoApply} // Включаем автоприменение фильтров
        />
      </div>
    </PopoverContent>
  );
};
