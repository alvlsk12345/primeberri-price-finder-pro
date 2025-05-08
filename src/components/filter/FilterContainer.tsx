
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { ProductFilters } from "@/services/types";

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
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            {children}
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Сбросить
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
