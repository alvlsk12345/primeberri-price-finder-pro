
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { SearchResults } from "@/components/SearchResults";
import { CostCalculator } from "@/components/CostCalculator";
import { SearchForm } from "@/components/SearchForm";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { searchProducts } from "@/services/productService";
import { Product, ProductFilters } from "@/services/types";
import { FilterPanel } from "@/components/FilterPanel";
import { autoTranslateQuery } from "@/services/translationService";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cachedResults, setCachedResults] = useState<{[page: number]: Product[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [originalQuery, setOriginalQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Мемоизированная функция для поиска товаров
  const handleSearch = useCallback(async (page: number = 1, forceNewSearch: boolean = false) => {
    // Проверяем, есть ли запрос для поиска
    if (!searchQuery && !lastSearchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Используем актуальный поисковый запрос или последний успешный
    const queryToUse = searchQuery || lastSearchQuery;
    
    setIsLoading(true);
    
    try {
      // Если это та же страница для того же запроса и у нас есть кэшированные результаты
      const isSameQuery = queryToUse === lastSearchQuery;
      if (!forceNewSearch && isSameQuery && cachedResults[page]) {
        console.log(`Используем кэшированные результаты для страницы ${page}`);
        setSearchResults(cachedResults[page]);
        setCurrentPage(page);
        setIsLoading(false);
        return;
      }
      
      // Сохраняем оригинальный запрос (для отображения пользователю)
      setOriginalQuery(queryToUse);
      
      // Если это новый поисковый запрос, сохраняем его
      if (!isSameQuery || forceNewSearch) {
        setLastSearchQuery(queryToUse);
        // Сбрасываем кэш результатов при новом запросе
        setCachedResults({});
      }
      
      // Устанавливаем текущую страницу перед выполнением запроса
      setCurrentPage(page);
      
      // Переводим запрос на английский, если он на русском
      let translatedQuery;
      try {
        translatedQuery = await autoTranslateQuery(queryToUse);
        console.log(`Запрос: "${queryToUse}" ${translatedQuery !== queryToUse ? `был переведен на: "${translatedQuery}"` : 'не требует перевода'}`);
      } catch (translateError) {
        console.error('Ошибка при переводе запроса:', translateError);
        translatedQuery = queryToUse; // Используем оригинальный запрос при ошибке перевода
        toast.error('Произошла ошибка при переводе запроса, используем исходный текст');
      }
      
      // Используем переведенный запрос для поиска
      const results = await searchProducts({
        query: translatedQuery,
        page: page,
        filters: filters
      });
      
      // Сохраняем найденные товары в состояние и в кэш
      if (results.products.length > 0) {
        setSearchResults(results.products);
        setCachedResults(prev => ({...prev, [page]: results.products}));
        setTotalPages(results.totalPages);
        toast.success(`Найдено ${results.products.length} товаров!`);
      } else {
        // Проверяем, есть ли у нас результаты в кэше для текущего поискового запроса
        if (cachedResults[1] && cachedResults[1].length > 0 && isSameQuery) {
          setSearchResults(cachedResults[1]);
          setCurrentPage(1);
          toast.info('Ошибка при загрузке страницы, показаны результаты первой страницы');
        } else {
          setSearchResults([]);
          toast.info('По вашему запросу ничего не найдено.');
        }
      }
      
      // Обозначаем, что поиск был выполнен
      setHasSearched(true);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      
      // При ошибке проверяем, есть ли у нас кэшированные результаты
      if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
        // Если ошибка произошла при смене страницы, используем текущие кэшированные результаты
        setSearchResults(cachedResults[currentPage]);
      } else if (cachedResults[1] && cachedResults[1].length > 0) {
        // Если нет результатов для текущей страницы, возвращаемся к первой странице
        setSearchResults(cachedResults[1]);
        setCurrentPage(1);
        toast.info('Возврат к первой странице из-за ошибки');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, lastSearchQuery, filters, cachedResults]);

  // Обработчик выбора товара
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${page}`);
      handleSearch(page);
    }
  };
  
  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Сбрасываем на первую страницу при изменении фильтров
    handleSearch(1, true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Узнайте, сколько вы сэкономите на товаре из Европы и США
            </CardTitle>
            <CardDescription>
              Найдите товар, и мы покажем, сколько вы можете сэкономить при доставке в Россию
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <SearchForm 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={() => handleSearch(1, true)}
                isLoading={isLoading}
              />

              {hasSearched && searchResults.length === 0 && !isLoading && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 text-amber-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>По вашему запросу ничего не найдено. Пожалуйста, проверьте запрос или попробуйте позже.</p>
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <h2 className="text-xl font-semibold">
                      Результаты поиска{originalQuery ? ` "${originalQuery}"` : ''}:
                    </h2>
                    <FilterPanel 
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      results={searchResults}
                    />
                  </div>
                  <SearchResults 
                    results={searchResults} 
                    onSelect={handleProductSelect} 
                    selectedProduct={selectedProduct}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {selectedProduct && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Расчет стоимости:</h2>
                  <CostCalculator product={selectedProduct} />
                  
                  <ActionButtons 
                    selectedProduct={selectedProduct}
                    searchQuery={searchQuery}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <BenefitsSection />
        <PageFooter />
      </main>
    </div>
  );
};

export default Index;
