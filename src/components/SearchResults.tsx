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
  console.log('Рендерим результаты поиска:', results, 'Текущая страница:', currentPage, 'Всего страниц:', totalPages);

  // Check if results are available
  if (!results || results.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-lg text-gray-500">Товары не найдены.</p>
      </div>
    );
  }

  // Ensure unique keys for products
  const productsWithUniqueKeys = results.map(product => {
    // If the product already has a unique ID, use it
    if (product.id) {
      return product;
    }
    
    // Otherwise, create a unique ID based on other properties
    const uniqueId = `${product.title}-${product.price}-${Math.random().toString(36).substr(2, 9)}`;
    return { ...product, id: uniqueId };
  });

  return (
    <div className="space-y-4">
      <ProductList 
        products={productsWithUniqueKeys}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
      />
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
