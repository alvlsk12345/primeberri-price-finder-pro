
import { useRef, useCallback } from 'react';
import { ProductFilters } from "@/services/types";
import { useLocalFiltering } from "@/hooks/useLocalFiltering";

type FilterActionProps = {
  allResults: Product[];
  setFilters: (filters: ProductFilters) => void;
  handleSearch: (page: number, forceNewSearch: boolean) => Promise<void>;
  filters: ProductFilters;
  setSearchResults: (results: Product[]) => void;
};

export function useFilterActions({
  allResults,
  setFilters,
  handleSearch,
  filters,
  setSearchResults
}: FilterActionProps) {
  // Используем хук для локальной фильтрации
  const { applyFiltersLocally } = useLocalFiltering({
    allResults,
    filters,
    setSearchResults
  });
  
  // Отслеживаем, содержит ли запрос фильтры, которые требуют нового поиска
  const requiresNewSearch = (newFilters: ProductFilters, currentFilters: ProductFilters): boolean => {
    // Изменение стран или языка требует нового запроса
    if (JSON.stringify(newFilters.countries) !== JSON.stringify(currentFilters.countries)) {
      console.log('Изменение стран требует нового поиска');
      return true;
    }
    if (newFilters.language !== currentFilters.language) {
      console.log('Изменение языка требует нового поиска');
      return true;
    }
    return false;
  };
  
  // Модифицированный обработчик изменения фильтров - применяет фильтры локально
  const handleFilterChange = useCallback((newFilters: ProductFilters) => {
    console.log('Применение фильтров:', newFilters);
    
    // Устанавливаем новые фильтры
    setFilters(newFilters);
    
    // Проверяем, нужно ли выполнять новый поиск или достаточно локальной фильтрации
    if (requiresNewSearch(newFilters, filters)) {
      console.log('Фильтры изменились, требующие нового поиска API');
      // Сбрасываем на первую страницу при изменении фильтров и запускаем новый поиск
      handleSearch(1, true);
    } else if (allResults && allResults.length > 0) {
      console.log('Применяем фильтры локально без нового запроса API');
      // Применяем фильтры локально к имеющимся результатам
      const filteredResults = applyFiltersLocally(allResults, newFilters);
      setSearchResults(filteredResults);
    }
  }, [allResults, filters, setFilters, handleSearch, setSearchResults, applyFiltersLocally]);
  
  return {
    handleFilterChange
  };
}
