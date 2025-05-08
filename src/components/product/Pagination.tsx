
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
  if (totalPages <= 1) {
    return null;
  }

  // Handler for page change with debugging
  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Changing to page:', page, 'from current page:', currentPage);
    
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Function to generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Logic to determine which page numbers to show
    let startPage = 1;
    let endPage = totalPages;
    
    if (totalPages > maxVisiblePages) {
      // Calculate start and end page based on current page
      const halfWay = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfWay + 1) {
        // Near the start
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfWay) {
        // Near the end
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        // Middle
        startPage = currentPage - halfWay;
        endPage = currentPage + halfWay;
      }
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={(e) => handlePageChange(i, e)}
            href="#"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Using Shadcn UI Pagination component
  return (
    <div className="flex justify-center mt-6">
      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => handlePageChange(currentPage - 1, e)} 
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {generatePaginationItems()}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => handlePageChange(currentPage + 1, e)} 
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
};
