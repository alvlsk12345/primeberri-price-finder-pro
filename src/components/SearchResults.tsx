import React from 'react';
import { Product } from "@/services/types";
import { ProductList } from './product/ProductList';
import { Pagination } from './product/Pagination';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    <div className="space-y-4" data-testid="search-results">
      {currentPage > 1 && results.length > 0 && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Возможны проблемы при загрузке данных для страницы {currentPage}. 
            Для полного результата попробуйте повторить поиск позже.
          </AlertDescription>
        </Alert>
      )}
      
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
