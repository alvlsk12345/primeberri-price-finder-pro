
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
  
  // Модифицированный обработчик изменения страницы - работает только с локальными данными
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
      // ИСПРАВЛЕНИЕ: Вместо функционального обновления, просто увеличиваем текущее значение на 1
      setPageChangeCount(pageChangeCount + 1);
      
      // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Просто обновляем текущую страницу без запроса новых данных
      // Это позволит использовать кешированные данные без нового API-запроса
      setCurrentPage(page);
      
      console.log(`Успешно переключено на страницу ${page} (клиентская пагинация)`);
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
