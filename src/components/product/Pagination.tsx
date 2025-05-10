
import React, { useCallback, useMemo } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Не показываем пагинацию, если страница только одна
  if (totalPages <= 1) {
    return null;
  }

  // Улучшенный обработчик клика по странице с использованием useCallback для предотвращения повторных рендеров
  const handlePageClick = useCallback((pageNumber: number) => (e: React.MouseEvent) => {
    // Предотвращаем стандартное поведение браузера (переход по ссылке)
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем, что страница валидна и не является текущей
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= totalPages) {
      console.log(`Pagination: Переход с ${currentPage} на страницу ${pageNumber}`);
      onPageChange(pageNumber);
    } else {
      console.log(`Pagination: Отклонен переход на страницу ${pageNumber} (текущая: ${currentPage}, всего: ${totalPages})`);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Создаем элементы пагинации с использованием useMemo для оптимизации
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Генерация компонента кнопки страницы
    const generatePageButton = (pageNumber: number) => {
      const isDisabled = pageNumber > totalPages;
      const isActive = currentPage === pageNumber;
      return (
        <PaginationItem key={pageNumber} data-testid={`pagination-item-${pageNumber}`}>
          <button
            onClick={handlePageClick(pageNumber)}
            className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors 
              ${isActive 
                ? 'border border-input bg-background shadow-sm' 
                : 'hover:bg-accent hover:text-accent-foreground'} 
              ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isDisabled}
            aria-current={isActive ? "page" : undefined}
            type="button"
          >
            {pageNumber}
          </button>
        </PaginationItem>
      );
    };

    // Логика пагинации в зависимости от количества страниц
    if (totalPages <= maxVisiblePages) {
      // Если страниц немного, показываем все
      for (let i = 1; i <= totalPages; i++) {
        items.push(generatePageButton(i));
      }
    } else {
      // Сложная логика для большого количества страниц
      if (currentPage <= 3) {
        // В начале списка
        for (let i = 1; i <= 4; i++) {
          items.push(generatePageButton(i));
        }
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
        items.push(generatePageButton(totalPages));
      } else if (currentPage >= totalPages - 2) {
        // В конце списка
        items.push(generatePageButton(1));
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(generatePageButton(i));
        }
      } else {
        // Где-то в середине
        items.push(generatePageButton(1));
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(generatePageButton(i));
        }
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
        items.push(generatePageButton(totalPages));
      }
    }
    
    return items;
  }, [currentPage, totalPages, handlePageClick]);

  return (
    <div className="flex justify-center mt-6" data-testid="pagination-component">
      <ShadcnPagination>
        <PaginationContent>
          {/* Кнопка "предыдущая страница" */}
          {generateNavButton('previous', currentPage, totalPages, handlePageClick)}
          
          {/* Элементы страниц */}
          {paginationItems}
          
          {/* Кнопка "следующая страница" */}
          {generateNavButton('next', currentPage, totalPages, handlePageClick)}
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
};

// Вспомогательная функция для генерации навигационной кнопки (вынесена из компонента для читабельности)
function generateNavButton(
  type: 'previous' | 'next', 
  currentPage: number, 
  totalPages: number, 
  handlePageClick: (page: number) => (e: React.MouseEvent) => void
) {
  const isNext = type === 'next';
  const pageNumber = isNext ? currentPage + 1 : currentPage - 1;
  const isDisabled = isNext ? currentPage >= totalPages : currentPage <= 1;
  const label = isNext ? 'Следующая' : 'Предыдущая';
  const icon = isNext ? '→' : '←';

  return (
    <PaginationItem key={`nav-${type}`}>
      <button
        onClick={handlePageClick(pageNumber)}
        className={`flex h-9 items-center gap-1 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground 
          ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
        disabled={isDisabled}
        aria-label={`Перейти на ${label.toLowerCase()} страницу`}
        type="button"
        data-testid={`pagination-${type}`}
      >
        {!isNext && icon}
        {label}
        {isNext && icon}
      </button>
    </PaginationItem>
  );
}
