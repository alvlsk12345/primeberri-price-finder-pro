
import { ProductFilters } from "@/services/types";

type FilterActionProps = {
  setFilters: (filters: ProductFilters) => void;
  handleSearch: (page: number, forceNewSearch: boolean) => Promise<void>;
};

export function useFilterActions({
  setFilters,
  handleSearch
}: FilterActionProps) {
  
  // Модифицированный обработчик изменения фильтров - применяет фильтры сразу
  const handleFilterChange = (newFilters: ProductFilters) => {
    // Устанавливаем новые фильтры
    setFilters(newFilters);
    
    // Сразу выполняем поиск с новыми фильтрами
    console.log("Автоматически применяем фильтры после изменения");
    // Сбрасываем на первую страницу при изменении фильтров и принудительно запускаем новый поиск
    handleSearch(1, true);
  };
  
  return {
    handleFilterChange
  };
}
