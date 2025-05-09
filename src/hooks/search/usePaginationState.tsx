
import { useState } from 'react';

export function usePaginationState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageChangeCount, setPageChangeCount] = useState(0);
  
  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    pageChangeCount,
    setPageChangeCount,
  };
}
