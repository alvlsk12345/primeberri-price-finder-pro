
import React from 'react';
import { Product } from "@/services/types";
import { NoSearchResults } from './search/NoSearchResults';
import { ProductListContainer } from './search/ProductListContainer';

type SearchResultsProps = {
  results: Product[];
  onSelect: (product: Product) => void;
  selectedProduct: Product | null;
  currentPage: number;
  totalPages: number; 
  onPageChange: (page: number) => void;
  isDemo?: boolean;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onSelect, 
  selectedProduct,
  currentPage,
  totalPages,
  onPageChange,
  isDemo = false
}) => {
  console.log('SearchResults render:', {
    resultsCount: results?.length || 0,
    currentPage,
    totalPages,
    hasSelectedProduct: !!selectedProduct,
    isDemo
  });

  // Check if results are available
  if (!results || results.length === 0) {
    return <NoSearchResults />;
  }

  // Ensure all products have unique IDs to prevent React key issues
  const productsWithUniqueKeys = results.map((product, index) => {
    // If the product already has a unique ID, use it
    if (product.id) {
      return product;
    }
    
    // Otherwise, create a unique ID based on other properties and index
    // Using combination of title, price, index and timestamp to ensure uniqueness
    const uniqueId = `${product.title}-${product.price}-${index}-${Date.now()}`;
    return { ...product, id: uniqueId };
  });

  // Limit to 9 products per page
  const paginatedProducts = productsWithUniqueKeys.slice(0, 9);

  // Handle page change with validation and debouncing
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: Page change requested from ${currentPage} to ${page}`);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Вызываем родительский обработчик изменения страницы
      onPageChange(page);
    } else {
      console.log(`SearchResults: Invalid page change request: ${page}`);
    }
  };

  return (
    <div data-testid="search-results">
      <ProductListContainer 
        products={paginatedProducts}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isDemo={isDemo}
      />
    </div>
  );
};
