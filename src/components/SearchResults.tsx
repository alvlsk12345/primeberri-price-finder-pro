import React from 'react';
import { Product } from "@/services/types";
import { ProductList } from './product/ProductList';
import { Pagination } from './product/Pagination';

type SearchResultsProps = {
  results: Product[];
  onSelect: (product: Product) => void;
  selectedProduct: Product | null;
  currentPage: number;
  totalPages: number; 
  onPageChange: (page: number) => void;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onSelect, 
  selectedProduct,
  currentPage,
  totalPages,
  onPageChange
}) => {
  console.log('SearchResults render:', {
    resultsCount: results?.length || 0,
    currentPage,
    totalPages,
    hasSelectedProduct: !!selectedProduct
  });

  // Check if results are available
  if (!results || results.length === 0) {
    return (
      <div className="text-center p-6" data-testid="no-results">
        <p className="text-lg text-gray-500">Товары не найдены.</p>
      </div>
    );
  }

  // Ensure all products have unique IDs to prevent React key issues
  const productsWithUniqueKeys = results.map(product => {
    // If the product already has a unique ID, use it
    if (product.id) {
      return product;
    }
    
    // Otherwise, create a unique ID based on other properties
    // Using combination of title, price and random string to ensure uniqueness
    const uniqueId = `${product.title}-${product.price}-${Math.random().toString(36).substring(2, 9)}`;
    return { ...product, id: uniqueId };
  });

  // Handle page change with validation
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: Page change requested from ${currentPage} to ${page}`);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="space-y-4" data-testid="search-results">
      <ProductList 
        products={productsWithUniqueKeys}
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
