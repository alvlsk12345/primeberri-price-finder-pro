
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
  
  // Добавляем проверку для обнаружения несоответствия между рассчитанным и переданным числом страниц
  useEffect(() => {
    if (actualTotalPages !== totalPages) {
      console.warn(`SearchResults: Несоответствие в количестве страниц: рассчитано ${actualTotalPages}, передано ${totalPages}`);
      
      // Если рассчитанное значение больше переданного, показываем уведомление
      if (actualTotalPages > totalPages) {
        toast.info(`Доступно больше результатов (${actualTotalPages} страниц)`, { 
          duration: 3000 
        });
      }
    }
  }, [actualTotalPages, totalPages]);
  
  console.log(`Пагинация: страница ${currentPage}/${Math.max(actualTotalPages, totalPages)}, показываем товары с ${startIndex+1} по ${Math.min(endIndex, productsWithUniqueKeys.length)} из ${productsWithUniqueKeys.length}`);

  // Handle page change с клиентской пагинацией
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: Page change requested from ${currentPage} to ${page}`);
    
    // Используем максимальное из рассчитанного и переданного количества страниц
    const effectiveTotalPages = Math.max(actualTotalPages, totalPages);
    
    // Усиленная проверка валидности запрошенной страницы
    if (page >= 1 && page <= effectiveTotalPages && page !== currentPage) {
      console.log(`SearchResults: Переход на страницу ${page} разрешен (клиентская пагинация)`);
      onPageChange(page);
    } else {
      if (page === currentPage) {
        console.log(`SearchResults: Уже находимся на странице ${page}, переход не требуется`);
      } else {
        console.log(`SearchResults: Invalid page change request: ${page}, effectiveTotalPages: ${effectiveTotalPages}`);
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
        // Используем максимальное из рассчитанного и переданного количества страниц
        totalPages={Math.max(actualTotalPages, totalPages)}
        onPageChange={handlePageChange}
        isDemo={isDemo}
      />
    </div>
  );
};
