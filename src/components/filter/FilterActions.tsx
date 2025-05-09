
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  resetFilters: () => void;
  applyFilters: () => void;
  autoApply?: boolean; // Добавляем новый необязательный параметр
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  resetFilters,
  applyFilters,
  autoApply = false // По умолчанию autoApply отключен
}) => {
  // Если autoApply включен, применяем фильтры автоматически
  React.useEffect(() => {
    if (autoApply) {
      applyFilters();
    }
  }, [autoApply, applyFilters]);

  return (
    <div className="flex justify-between pt-2">
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Сбросить
      </Button>
      <Button variant="brand" size="sm" onClick={applyFilters}>
        Применить
      </Button>
    </div>
  );
};
