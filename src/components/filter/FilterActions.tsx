
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  resetFilters: () => void;
  applyFilters?: () => void; // Делаем необязательным
  autoApply?: boolean; // Добавляем параметр автоприменения
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  resetFilters,
  applyFilters,
  autoApply = true // По умолчанию включено автоприменение
}) => {
  // Если autoApply включен и applyFilters доступен, применяем фильтры автоматически
  React.useEffect(() => {
    if (autoApply && applyFilters) {
      applyFilters();
    }
  }, [autoApply, applyFilters]);

  return (
    <div className="flex justify-end pt-2">
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Сбросить
      </Button>
      {/* Кнопка "Применить" удалена */}
    </div>
  );
};
