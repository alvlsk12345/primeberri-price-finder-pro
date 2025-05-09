
import React from 'react';
import { SortOption } from "@/services/types";

// Этот компонент больше не используется напрямую, так как сортировка
// перенесена в кнопки SortButtons рядом с фильтром
interface SortFilterProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({ sortBy, onSortChange }) => {
  // Пустая реализация, т.к. функциональность перенесена в SortButtons
  return null;
};
