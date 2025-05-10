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
    console.log(`SearchResults: текущая страница изменилась на ${currentPage} (всего страниц: ${totalPages})`);
  }, [currentPage, totalPages]);

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

  // Пагинация на клиенте - по 12 товаров на страницу
  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Получаем товары только для текущей страницы - КЛИЕНТСКАЯ ПАГИНАЦИЯ
  const paginatedProducts = useMemo(() => 
    productsWithUniqueKeys.slice(startIndex, endIndex),
    [productsWithUniqueKeys, startIndex, endIndex]
  );
  
  // Рассчитываем общее количество страниц на основе фактического количества товаров
  const actualTotalPages = useMemo(() => 
    Math.max(1, Math.ceil(productsWithUniqueKeys.length / itemsPerPage)),
    [productsWithUniqueKeys.length]
  );
  
  // УЛУЧШЕННАЯ ЛОГИКА: Логируем и уведомляем о количестве результатов
  useEffect(() => {
    console.log(`Количество продуктов: ${productsWithUniqueKeys.length}, страниц: ${actualTotalPages}, заявленных страниц: ${totalPages}`);
    
    // Больше не показываем уведомление о несоответствии количества страниц,
    // так как теперь мы используем actualTotalPages в компоненте ProductListContainer
  }, [productsWithUniqueKeys.length, actualTotalPages, totalPages]);
  
  console.log(`Пагинация: страница ${currentPage}/${actualTotalPages}, показываем товары с ${startIndex+1} по ${Math.min(endIndex, productsWithUniqueKeys.length)} из ${productsWithUniqueKeys.length}`);

  // Handle page change с клиентской пагинацией
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: Page change requested from ${currentPage} to ${page}`);
    
    // ИСПРАВЛЕНО: Используем только actualTotalPages вместо maxTotalPages
    if (page >= 1 && page <= actualTotalPages && page !== currentPage) {
      console.log(`SearchResults: Переход на страницу ${page} разрешен (клиентская пагинация)`);
      onPageChange(page);
    } else {
      if (page === currentPage) {
        console.log(`SearchResults: Уже находимся на странице ${page}, переход не требуется`);
      } else {
        console.log(`SearchResults: Invalid page change request: ${page}, actualTotalPages: ${actualTotalPages}`);
      }
    }
  };

  return (
    <div data-testid="search-results">
      <ProductListContainer 
        products={paginatedProducts}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
        currentPage={currentPage}
        // ИСПРАВЛЕНО: Используем только actualTotalPages
        totalPages={actualTotalPages}
        onPageChange={handlePageChange}
        isDemo={isDemo}
      />
    </div>
  );
};
