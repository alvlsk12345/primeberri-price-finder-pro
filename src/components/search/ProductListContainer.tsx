
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
  // Улучшенный обработчик смены страницы с дополнительными проверками
  const handlePageChange = useCallback((page: number) => {
    console.log(`ProductListContainer: Запрос на смену страницы с ${currentPage} на ${page}`);
    
    // Важная проверка: убедиться, что у нас действительно есть больше одной страницы
    if (totalPages <= 1 && page !== 1) {
      console.warn(`ProductListContainer: Запрошена страница ${page}, но всего страниц: ${totalPages}`);
      toast.error(`Страница ${page} недоступна. В данный момент доступна только страница 1.`, {
        duration: 3000
      });
      return;
    }
    
    // Валидация страницы для предотвращения некорректных переходов
    if (page <= 0 || page > totalPages) {
      console.warn(`ProductListContainer: Запрошена недопустимая страница ${page} (всего: ${totalPages})`);
      
      if (page > totalPages && totalPages > 0) {
        toast.error(`Страница ${page} не существует. Максимум: ${totalPages}`, {
          duration: 3000
        });
      }
      return;
    }
    
    // Проверка, что запрошенная страница отличается от текущей
    if (page === currentPage) {
      console.log(`ProductListContainer: Уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    // Показываем индикатор загрузки
    console.log(`ProductListContainer: Переход на страницу ${page}`);
    const toastId = `page-change-${page}`;
    toast.info(`Загрузка страницы ${page}...`, {
      id: toastId,
      duration: 2000
    });
    
    // Вызываем функцию смены страницы
    onPageChange(page);
    
    // Дополнительная проверка через таймаут (для отладки асинхронных проблем)
    setTimeout(() => {
      console.log(`ProductListContainer: Через 500мс после запроса страницы ${page}, текущая страница: ${currentPage}`);
    }, 500);
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
      
      {/* Важное изменение: показываем пагинацию только если у нас больше 1 страницы */}
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
