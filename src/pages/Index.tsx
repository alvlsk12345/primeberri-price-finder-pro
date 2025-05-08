
import React, { useState } from 'react';
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});

  // Функция для поиска товаров
  const handleSearch = async (page: number = 1) => {
    if (!searchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    setIsLoading(true);
    setCurrentPage(page);
    
    try {
      // Используем наш сервис для поиска товаров с пагинацией и фильтрами
      const results = await searchProducts({
        query: searchQuery,
        page: page,
        filters: filters
      });
      
      setSearchResults(results.products);
      setTotalPages(results.totalPages);
      setIsLoading(false);
      
      if (results.products.length > 0) {
        toast.success(`Найдено ${results.products.length} товаров!`);
      } else {
        toast.info('По вашему запросу ничего не найдено.');
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      setIsLoading(false);
    }
  };

  // Обработчик выбора товара
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      handleSearch(page);
    }
  };
  
  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Сбрасываем на первую страницу при изменении фильтров
    handleSearch(1);
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
                handleSearch={() => handleSearch(1)}
                isLoading={isLoading}
              />

              {searchResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <h2 className="text-xl font-semibold">Результаты поиска:</h2>
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
