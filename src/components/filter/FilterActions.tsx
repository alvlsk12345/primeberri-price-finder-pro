
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  resetFilters: () => void;
  applyFilters: () => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  resetFilters,
  applyFilters
}) => {
  return (
    <div className="flex justify-between pt-2">
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Сбросить
      </Button>
      <Button size="sm" onClick={applyFilters}>
        Применить
      </Button>
    </div>
  );
};
