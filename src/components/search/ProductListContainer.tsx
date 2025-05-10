
import React, { useCallback, useEffect } from 'react';
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
  // Добавляем эффект для логирования обновлений пропсов
  useEffect(() => {
    console.log(`ProductListContainer: обновлен с currentPage=${currentPage}, totalPages=${totalPages}, products.length=${products.length}`);
  }, [currentPage, totalPages, products]);

  // Улучшенный обработчик смены страницы для клиентской пагинации
  const handlePageChange = useCallback((page: number) => {
    console.log(`ProductListContainer: запрос на смену страницы с ${currentPage} на ${page}`);
    
    // Базовые проверки валидности
    if (page === currentPage) {
      console.log(`ProductListContainer: уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: проверяем наличие страниц
    if (totalPages <= 0) {
      console.warn(`ProductListContainer: некорректное общее количество страниц: ${totalPages}`);
      toast.error(`Невозможно перейти на страницу ${page} - страницы не инициализированы`, {
        duration: 3000
      });
      return;
    }
    
    // Проверка на минимальную страницу
    if (page <= 0) {
      console.warn(`ProductListContainer: запрошена некорректная страница ${page} (меньше 1)`);
      return;
    }
    
    // Проверка на максимальную страницу
    if (page > totalPages) {
      console.warn(`ProductListContainer: запрошена недопустимая страница ${page} (всего: ${totalPages})`);
      
      toast.error(`Страница ${page} не существует. Максимум: ${totalPages}`, {
        duration: 3000
      });
      return;
    }
    
    console.log(`ProductListContainer: переход на страницу ${page} (клиентская пагинация)`);
    
    // Вызываем функцию смены страницы из пропсов
    onPageChange(page);
    
    // Дополнительная проверка через таймаут (для отладки)
    setTimeout(() => {
      console.log(`ProductListContainer: через 500мс после запроса страницы ${page}, текущая страница: ${currentPage}`);
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
      
      {/* УЛУЧШЕННАЯ ПРОВЕРКА: Показываем пагинацию только при наличии корректного количества страниц */}
      {totalPages > 1 ? (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="text-center text-sm text-gray-500 py-2">
          {products.length > 0 && `Показано ${products.length} товаров на одной странице`}
        </div>
      )}
    </div>
  );
};
