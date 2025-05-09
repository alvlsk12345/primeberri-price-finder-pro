
type PaginationActionProps = {
  currentPage: number;
  totalPages: number;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  handleSearch: (page: number) => Promise<void>;
};

export function usePaginationActions({
  currentPage,
  totalPages,
  pageChangeCount,
  setPageChangeCount,
  handleSearch
}: PaginationActionProps) {
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      // Увеличиваем счетчик
      setPageChangeCount(pageChangeCount + 1);
      // Важное исправление: перед выполнением поиска устанавливаем текущую страницу
      // Запускаем поиск с новой страницей
      handleSearch(page);
    }
  };
  
  return {
    handlePageChange
  };
}
