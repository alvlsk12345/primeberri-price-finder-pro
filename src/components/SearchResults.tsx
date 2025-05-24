import React, { useMemo, useEffect } from 'react';
import { Product } from "@/services/types";
import { NoSearchResults } from './search/NoSearchResults';
import { ProductListContainer } from './search/ProductListContainer';
import { toast } from "sonner";

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
  // Используем useEffect для логирования изменений страницы для отладки
  useEffect(() => {
    console.log(`SearchResults component: текущая страница ${currentPage}, всего страниц: ${totalPages}, количество результатов: ${results?.length}`);
  }, [currentPage, totalPages, results]);

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
    const uniqueId = `${product.title}-${product.price}-${index}-${Date.now()}`;
    return { ...product, id: uniqueId };
  }), [results]);

  // Handle page change с улучшенной проверкой валидности страницы
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: запрос смены страницы с ${currentPage} на ${page} (всего: ${totalPages})`);
    
    // Проверяем валидность запрошенной страницы
    if (page < 1) {
      console.warn(`SearchResults: запрошена некорректная страница ${page} (меньше 1)`);
      return;
    }
    
    if (page > totalPages) {
      console.warn(`SearchResults: запрошена страница ${page}, но максимум доступно ${totalPages}`);
      toast.error(`Страница ${page} недоступна. Максимум: ${totalPages}`, { duration: 3000 });
      return;
    }
    
    if (page === currentPage) {
      console.log(`SearchResults: уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    console.log(`SearchResults: переход на страницу ${page} разрешен`);
    onPageChange(page);
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
        isDemo={isDemo}
      />
    </div>
  );
};
