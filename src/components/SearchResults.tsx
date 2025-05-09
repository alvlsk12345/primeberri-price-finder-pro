
import React, { useEffect } from 'react';
import { Product } from "@/services/types";
import { NoSearchResults } from './search/NoSearchResults';
import { ProductListContainer } from './search/ProductListContainer';
import { getProductLink } from "@/services/urlService";

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

  // Проверяем и логируем ссылки на товары при изменении результатов
  useEffect(() => {
    if (results && results.length > 0) {
      console.log('Проверка ссылок на товары:');
      results.slice(0, 3).forEach((product, index) => {
        const generatedLink = getProductLink(product);
        console.log(`Товар ${index + 1}: ${product.title}`);
        console.log(`  - API ссылка: ${product.link || 'отсутствует'}`);
        console.log(`  - Сгенерированная ссылка: ${generatedLink}`);
      });
    }
  }, [results]);

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
        products={productsWithUniqueKeys}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
