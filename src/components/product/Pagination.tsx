
import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";

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

  // Улучшенный обработчик клика по пагинации
  const handlePageClick = (page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Предотвращаем дефолтное поведение ссылки для предотвращения перезагрузки страницы
    e.preventDefault();
    e.stopPropagation();
    
    // Дополнительная проверка, чтобы не вызывать обработчик для текущей страницы или недопустимой страницы
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Pagination: Переход с ${currentPage} на страницу ${page}`);
      
      // Показываем уведомление о начале загрузки
      toast.info(`Загрузка страницы ${page}...`, {
        id: `page-change-${page}`,
        duration: 2000
      });
      
      // Вызываем обработчик изменения страницы
      onPageChange(page);
    } else {
      console.log(`Pagination: Отклонен переход на страницу ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
      
      // Если это недопустимая страница, показываем предупреждение
      if (page > totalPages) {
        toast.error("Запрошенная страница не существует");
      }
    }
  };

  // Функция для генерации элементов пагинации
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Если страниц меньше или равно максимальному количеству видимых страниц, показываем все страницы
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(generatePageItem(i));
      }
    } else {
      // Логика определения, какие страницы показывать при большом количестве страниц
      if (currentPage <= 3) {
        // Мы близко к началу
        for (let i = 1; i <= 4; i++) {
          items.push(generatePageItem(i));
        }
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
        items.push(generatePageItem(totalPages));
      } else if (currentPage >= totalPages - 2) {
        // Мы близко к концу
        items.push(generatePageItem(1));
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(generatePageItem(i));
        }
      } else {
        // Мы где-то в середине
        items.push(generatePageItem(1));
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(generatePageItem(i));
        }
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
        items.push(generatePageItem(totalPages));
      }
    }
    
    return items;
  };

  // Вспомогательная функция для создания элемента страницы пагинации
  const generatePageItem = (pageNumber: number) => {
    const isDisabled = pageNumber > totalPages;
    return (
      <PaginationItem key={pageNumber} data-testid={`pagination-item-${pageNumber}`}>
        <PaginationLink 
          isActive={currentPage === pageNumber}
          onClick={handlePageClick(pageNumber)}
          href="#"
          aria-current={currentPage === pageNumber ? "page" : undefined}
          className={isDisabled ? "pointer-events-none opacity-50" : ""}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );
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
