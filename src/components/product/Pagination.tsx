
import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Не отображаем пагинацию, если страница всего одна
  if (totalPages <= 1) {
    return null;
  }

  // Обработчик клика по пагинации с предотвращением дефолтного поведения
  const handlePageClick = (page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Предотвращаем дефолтное поведение ссылки для предотвращения перезагрузки страницы
    e.preventDefault();
    e.stopPropagation();
    
    // Дополнительная проверка, чтобы не вызывать обработчик для текущей страницы или недопустимой страницы
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Pagination: Переход с ${currentPage} на страницу ${page}`);
      onPageChange(page);
    } else {
      console.log(`Pagination: Отклонен переход на страницу ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
    }
  };

  // Функция для генерации элементов пагинации
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Логика определения, какие страницы показывать
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Корректировка, если мы находимся близко к концу
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Генерация номеров страниц
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} data-testid={`pagination-item-${i}`}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={handlePageClick(i)}
            href="#"
            aria-current={currentPage === i ? "page" : undefined}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="flex justify-center mt-6" data-testid="pagination-component">
      <ShadcnPagination>
        <PaginationContent>
          {/* Кнопка "Предыдущая страница" */}
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={handlePageClick(currentPage - 1)} 
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              data-testid="pagination-previous"
            />
          </PaginationItem>
          
          {/* Номера страниц */}
          {generatePaginationItems()}
          
          {/* Кнопка "Следующая страница" */}
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={handlePageClick(currentPage + 1)} 
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              data-testid="pagination-next"
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
};
