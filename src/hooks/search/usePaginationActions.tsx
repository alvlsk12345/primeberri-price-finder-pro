
type PaginationActionProps = {
  currentPage: number;
  totalPages: number;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  setCurrentPage: (page: number) => void; // Добавлен параметр для прямого обновления текущей страницы
  handleSearch: (page: number) => Promise<void>;
};

export function usePaginationActions({
  currentPage,
  totalPages,
  pageChangeCount,
  setPageChangeCount,
  setCurrentPage, // Добавлен параметр
  handleSearch
}: PaginationActionProps) {
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      
      // Важное исправление: перед выполнением поиска устанавливаем текущую страницу
      setCurrentPage(page);
      
      // Увеличиваем счетчик
      setPageChangeCount(pageChangeCount + 1);
      
      // Запускаем поиск с новой страницей
      handleSearch(page);
    }
  };
  
  return {
    handlePageChange
  };
}
