
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

  if (results.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-lg text-gray-500">Товары не найдены.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProductList 
        products={results}
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
