
type PaginationActionProps = {
  currentPage: number;
  totalPages: number;
  pageChangeCount: number;
  setPageChangeCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  handleSearch: (page: number) => Promise<void>;
};

export function usePaginationActions({
  currentPage,
  totalPages,
  pageChangeCount,
  setPageChangeCount,
  setCurrentPage,
  handleSearch
}: PaginationActionProps) {
  
  // Обработчик изменения страницы с усиленной логикой обеспечения корректности перелистывания
  const handlePageChange = async (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Изменение страницы с ${currentPage} на ${page}`);
      
      try {
        // Важное исправление: используем атомарное обновление состояния
        setCurrentPage(page);
        
        // Увеличиваем счетчик
        setPageChangeCount(pageChangeCount + 1);
        
        // Запускаем поиск с новой страницей и ждем завершения
        await handleSearch(page);
        
        console.log(`Успешно переключено на страницу ${page}`);
      } catch (error) {
        console.error(`Ошибка при переключении на страницу ${page}:`, error);
      }
    } else {
      console.log(`Некорректный запрос на смену страницы: ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
    }
  };
  
  return {
    handlePageChange
  };
}
