
import React from 'react';
import { Product } from "@/services/types";
import { ProductList } from '../product/ProductList';
import { Pagination } from '../product/Pagination';
import { SearchResultsAlert } from './SearchResultsAlert';

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
  const handlePageChange = (page: number) => {
    console.log(`ProductListContainer: Changing page from ${currentPage} to ${page}`);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="space-y-4">
      {currentPage > 1 && products.length > 0 && (
        <SearchResultsAlert currentPage={currentPage} />
      )}
      
      <ProductList 
        products={products}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
      />
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
