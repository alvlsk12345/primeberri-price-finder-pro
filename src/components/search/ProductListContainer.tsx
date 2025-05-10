
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
  // Улучшенный обработчик смены страницы для клиентской пагинации
  const handlePageChange = useCallback((page: number) => {
    console.log(`ProductListContainer: Запрос на смену страницы с ${currentPage} на ${page}`);
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Проверяем наличие страниц более осторожно
    if (totalPages <= 0) {
      console.warn(`ProductListContainer: Некорректное общее количество страниц: ${totalPages}`);
      toast.error(`Невозможно перейти на страницу ${page} - страницы не инициализированы`, {
        duration: 3000
      });
      return;
    }
    
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
    
    console.log(`ProductListContainer: Переход на страницу ${page} (клиентская пагинация)`);
    
    // Просто вызываем функцию смены страницы, без дополнительных запросов
    onPageChange(page);
    
    // Дополнительная проверка через таймаут (для отладки)
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
