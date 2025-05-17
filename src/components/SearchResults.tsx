
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
    console.log(`SearchResults component: текущая страница изменилась на ${currentPage} (всего страниц: ${totalPages})`);
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

  // Пагинация на клиенте - изменяем с 12 на 36 товаров на страницу
  const itemsPerPage = 36;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Получаем товары только для текущей страницы - КЛИЕНТСКАЯ ПАГИНАЦИЯ
  const paginatedProducts = useMemo(() => 
    productsWithUniqueKeys.slice(startIndex, endIndex),
    [productsWithUniqueKeys, startIndex, endIndex]
  );
  
  // Рассчитываем общее количество страниц на основе фактического количества товаров
  const actualTotalPages = useMemo(() => {
    const calculatedPages = Math.max(1, Math.ceil(productsWithUniqueKeys.length / itemsPerPage));
    console.log(`SearchResults: рассчитано фактическое количество страниц: ${calculatedPages} (товаров: ${productsWithUniqueKeys.length})`);
    
    // Проверка на несоответствие рассчитанных страниц и переданных через props
    if (calculatedPages !== totalPages) {
      console.warn(`SearchResults: несоответствие в количестве страниц - рассчитано ${calculatedPages}, но передано ${totalPages}`);
    }
    
    // Используем большее значение для безопасности
    return Math.max(calculatedPages, totalPages);
  }, [productsWithUniqueKeys.length, totalPages]);
  
  // УЛУЧШЕННАЯ ЛОГИКА: Логируем и уведомляем о количестве результатов
  useEffect(() => {
    console.log(`SearchResults: количество продуктов: ${productsWithUniqueKeys.length}, страниц: ${actualTotalPages}, заявленных страниц: ${totalPages}`);
    
    // Больше не показываем уведомление о несоответствии количества страниц,
    // так как теперь мы используем actualTotalPages в компоненте ProductListContainer
  }, [productsWithUniqueKeys.length, actualTotalPages, totalPages]);
  
  console.log(`Пагинация: страница ${currentPage}/${actualTotalPages}, показываем товары с ${startIndex+1} по ${Math.min(endIndex, productsWithUniqueKeys.length)} из ${productsWithUniqueKeys.length}`);

  // Handle page change с улучшенной проверкой валидности страницы
  const handlePageChange = (page: number) => {
    console.log(`SearchResults: запрос смены страницы с ${currentPage} на ${page} (всего: ${actualTotalPages})`);
    
    // Проверяем валидность запрошенной страницы
    if (page < 1) {
      console.warn(`SearchResults: запрошена некорректная страница ${page} (меньше 1)`);
      return;
    }
    
    if (page > actualTotalPages) {
      console.warn(`SearchResults: запрошена страница ${page}, но максимум доступно ${actualTotalPages}`);
      // Можно либо ограничить страницу максимумом, либо показать уведомление
      toast.error(`Страница ${page} недоступна. Максимум: ${actualTotalPages}`, { duration: 3000 });
      return;
    }
    
    if (page === currentPage) {
      console.log(`SearchResults: уже находимся на странице ${page}, переход не требуется`);
      return;
    }
    
    console.log(`SearchResults: переход на страницу ${page} разрешен (клиентская пагинация)`);
    onPageChange(page);
    
    // Дополнительная проверка через таймаут (для отладки)
    setTimeout(() => {
      console.log(`SearchResults: через 500мс после запроса страницы ${page}, текущая страница: ${currentPage}`);
    }, 500);
  };

  return (
    <div data-testid="search-results">
      <ProductListContainer 
        products={paginatedProducts}
        selectedProduct={selectedProduct}
        onSelect={onSelect}
        currentPage={currentPage}
        // ИСПРАВЛЕНО: Используем actualTotalPages вместо totalPages
        totalPages={actualTotalPages}
        onPageChange={handlePageChange}
        isDemo={isDemo}
      />
    </div>
  );
};
