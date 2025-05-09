
import React from 'react';
import { Product } from "@/services/types";
import { ProductList } from '../product/ProductList';
import { Pagination } from '../product/Pagination';
import { SearchResultsAlert } from './SearchResultsAlert';
import { toast } from "@/components/ui/sonner";
import { useSearch } from "@/contexts/SearchContext";

interface ProductListContainerProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductListContainer: React.FC<ProductListContainerProps> = ({
  products,
  selectedProduct,
  onSelect,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { apiErrorMode } = useSearch();
  
  // Enhanced page change handler with validation and feedback
  const handlePageChange = (page: number) => {
    console.log(`ProductListContainer: Changing page from ${currentPage} to ${page}`);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Show loading toast when changing pages
      toast.info(`Загрузка страницы ${page}...`, {
        id: `page-change-${page}`,
        duration: 2000
      });
      
      // Call the parent's onPageChange function
      onPageChange(page);
    } else if (page === currentPage) {
      // No need to reload the same page
      console.log(`Already on page ${page}, no change needed`);
    } else {
      // Invalid page requested
      console.log(`Invalid page request: ${page} (total: ${totalPages})`);
      if (page > totalPages) {
        toast.error(`Страница ${page} не существует`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {(currentPage > 1 || apiErrorMode) && products.length > 0 && (
        <SearchResultsAlert currentPage={currentPage} apiErrorMode={apiErrorMode} />
      )}
      
      <ProductList 
        products={products}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
      />
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
