
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
    if (page === currentPage) {
      console.log(`Уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      console.log(`Некорректный запрос на смену страницы: ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
      return;
    }
    
    console.log(`Изменение страницы с ${currentPage} на ${page}`);
    
    try {
      // Увеличиваем счетчик для отслеживания изменений и сразу устанавливаем страницу
      // Для предотвращения Race condition используем функциональное обновление
      setPageChangeCount(prev => prev + 1);
      
      // Важное изменение: сразу устанавливаем новую страницу для UI отзывчивости
      setCurrentPage(page);
      
      // Запускаем поиск с новой страницей и ждем завершения
      console.log(`Запуск поиска для страницы ${page}`);
      await handleSearch(page);
      
      console.log(`Успешно переключено на страницу ${page}`);
    } catch (error) {
      console.error(`Ошибка при переключении на страницу ${page}:`, error);
      
      // При ошибке возвращаемся на предыдущую страницу
      setCurrentPage(currentPage);
      throw error; // Пробрасываем ошибку выше для дальнейшей обработки
    }
  };
  
  return {
    handlePageChange
  };
}
