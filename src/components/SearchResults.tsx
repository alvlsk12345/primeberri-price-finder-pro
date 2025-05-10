
import React, { useMemo } from 'react';
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
  // Используем useMemo для предотвращения лишних перерендеров
  const resultsInfo = useMemo(() => ({
    resultsCount: results?.length || 0,
    currentPage,
    totalPages,
    hasSelectedProduct: !!selectedProduct,
    isDemo
  }), [results?.length, currentPage, totalPages, selectedProduct, isDemo]);
  
  console.log('SearchResults render:', resultsInfo);

  // Check if results are available
  if (!results || results.length === 0) {
    return <NoSearchResults />;
  }

  // Ensure all products have unique IDs to prevent React key issues
  const productsWithUniqueKeys = useMemo(() => results.map((product, index) => {
    // If the product already has a unique ID, use it
    if (product.id) {
      return product;
    }
    
    // Otherwise, create a unique ID based on other properties and index
    // Using combination of title, price, index and timestamp to ensure uniqueness
    const uniqueId = `${product.title}-${product.price}-${index}-${Date.now()}`;
    return { ...product, id: uniqueId };
  }), [results]);

  // Пагинация - по 12 товаров на страницу
  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Получаем товары только для текущей страницы
  const paginatedProducts = useMemo(() => 
    productsWithUniqueKeys.slice(startIndex, endIndex),
    [productsWithUniqueKeys, startIndex, endIndex]
  );
  
  // Рассчитываем общее количество страниц
  const actualTotalPages = useMemo(() => 
    Math.max(1, Math.ceil(productsWithUniqueKeys.length / itemsPerPage)),
    [productsWithUniqueKeys.length]
  );
  
  console.log(`Пагинация: страница ${currentPage}/${actualTotalPages}, показываем товары с ${startIndex+1} по ${Math.min(endIndex, productsWithUniqueKeys.length)}`);

  // Handle page change with validation
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: Page change requested from ${currentPage} to ${page}`);
    
    if (page >= 1 && page <= actualTotalPages && page !== currentPage) {
      // Убираем setTimeout для немедленного обновления страницы
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
        totalPages={actualTotalPages}
        onPageChange={handlePageChange}
        isDemo={isDemo}
      />
    </div>
  );
};
