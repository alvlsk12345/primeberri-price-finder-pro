
import React, { useCallback } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Improved page click handler with memoization to prevent unnecessary re-renders
  const handlePageClick = useCallback((page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default link behavior to avoid page reloads
    e.preventDefault();
    e.stopPropagation();
    
    // Only trigger for valid pages that aren't the current page
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Pagination: Переход с ${currentPage} на страницу ${page}`);
      onPageChange(page);
    } else {
      console.log(`Pagination: Отклонен переход на страницу ${page} (текущая: ${currentPage}, всего: ${totalPages})`);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Function to generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // If there are fewer pages than the maximum visible, show all pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(generatePageItem(i));
      }
    } else {
      // Logic for showing pages when there are more than the maximum visible
      if (currentPage <= 3) {
        // Near the beginning
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
        // Near the end
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
        // Somewhere in the middle
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

  // Helper function to create a pagination page item
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
          {/* Previous page button */}
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={handlePageClick(currentPage - 1)} 
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              data-testid="pagination-previous"
            />
          </PaginationItem>
          
          {/* Page numbers */}
          {generatePaginationItems()}
          
          {/* Next page button */}
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
