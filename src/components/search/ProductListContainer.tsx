
import React, { useCallback } from 'react';
import { Product } from "@/services/types";
import { ProductList } from '../product/ProductList';
import { Pagination } from '../product/Pagination';
import { SearchResultsAlert } from './SearchResultsAlert';
import { toast } from "sonner";

interface ProductListContainerProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDemo?: boolean;
}

export const ProductListContainer: React.FC<ProductListContainerProps> = ({
  products,
  selectedProduct,
  onSelect,
  currentPage,
  totalPages,
  onPageChange,
  isDemo = false
}) => {
  // Улучшенный обработчик смены страницы с useCallback для оптимизации
  const handlePageChange = useCallback((page: number) => {
    console.log(`ProductListContainer: Смена страницы с ${currentPage} на ${page}`);
    
    // Проверка валидности страницы
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Показываем индикатор загрузки
      const toastId = `page-change-${page}`;
      toast.info(`Загрузка страницы ${page}...`, {
        id: toastId,
        duration: 2000
      });
      
      // Вызываем функцию смены страницы
      onPageChange(page);
    } else if (page === currentPage) {
      // Уже на этой странице, не нужно перезагружать
      console.log(`Уже находимся на странице ${page}, никаких изменений не требуется`);
    } else {
      // Некорректная страница запрошена
      console.warn(`Неверный запрос страницы: ${page} (всего: ${totalPages})`);
      if (page > totalPages) {
        toast.error(`Страница ${page} не существует. Максимум: ${totalPages}`);
      }
    }
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div className="space-y-4">
      {/* Показываем уведомление для демо-данных или если мы не на первой странице */}
      {(isDemo || currentPage > 1) && products.length > 0 && (
        <SearchResultsAlert currentPage={currentPage} />
      )}
      
      <ProductList 
        products={products}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
      />
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
