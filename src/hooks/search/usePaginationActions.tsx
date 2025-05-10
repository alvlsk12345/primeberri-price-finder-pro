
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
  
  // Улучшенный обработчик изменения страницы с дополнительными проверками и логированием
  const handlePageChange = async (page: number) => {
    // Более подробное логирование для отладки проблем с пагинацией
    console.log(`usePaginationActions: Запрошена страница ${page}, текущая: ${currentPage}, всего: ${totalPages}`);
    
    if (page === currentPage) {
      console.log(`usePaginationActions: Уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    // Улучшенная проверка валидности страницы
    if (page < 1) {
      console.log(`usePaginationActions: Некорректный запрос на смену страницы: ${page} (меньше 1)`);
      return;
    }
    
    // Проверка на максимальный номер страницы только если totalPages > 0
    if (totalPages > 0 && page > totalPages) {
      console.log(`usePaginationActions: Некорректный запрос на смену страницы: ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
      return;
    }
    
    console.log(`usePaginationActions: Изменение страницы с ${currentPage} на ${page}, всего страниц: ${totalPages}`);
    
    try {
      // Увеличиваем счетчик для отслеживания изменений
      setPageChangeCount(pageChangeCount + 1);
      
      // Обновляем текущую страницу до вызова handleSearch - это обеспечит
      // немедленное обновление UI и более плавный переход между страницами
      setCurrentPage(page);
      
      // Вызываем handleSearch с новой страницей
      // handleSearch должен проверить, нужен ли API запрос или можно использовать кешированные данные
      await handleSearch(page);
      
      console.log(`usePaginationActions: Успешно переключено на страницу ${page}`);
    } catch (error) {
      console.error(`usePaginationActions: Ошибка при переключении на страницу ${page}:`, error);
      
      // При ошибке не возвращаемся на предыдущую страницу, это может вызвать зацикливание
      // setCurrentPage(currentPage);
      // Вместо этого показываем сообщение об ошибке (конкретная реализация может быть другой)
      console.log(`usePaginationActions: Остаёмся на странице ${page} несмотря на ошибку`);
      // throw error; - не пробрасываем ошибку, это может помешать пользовательскому опыту
    }
  };
  
  return {
    handlePageChange
  };
}
