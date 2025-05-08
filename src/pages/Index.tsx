
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { SearchResults } from "@/components/SearchResults";
import { CostCalculator } from "@/components/CostCalculator";
import { SearchForm } from "@/components/SearchForm";
import { BenefitsSection } from "@/components/BenefitsSection";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { searchProducts, type Product } from "@/services/productService";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error('Пожалуйста, введите запрос для поиска товара');
      return;
    }

    // Проверяем наличие API ключа
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast.error(
        <div>
          Необходимо добавить API ключ OpenAI.{' '}
          <Link to="/settings" className="underline">
            Перейти к настройкам
          </Link>
        </div>
      );
      return;
    }

    setIsLoading(true);
    try {
      // Используем наш сервис для поиска товаров
      const results = await searchProducts(searchQuery);
      
      setSearchResults(results);
      setIsLoading(false);
      
      if (results.length > 0) {
        toast.success('Товары найдены!');
      } else {
        toast.info('По вашему запросу ничего не найдено.');
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
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
                handleSearch={handleSearch}
                isLoading={isLoading}
              />

              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Результаты поиска:</h2>
                  <SearchResults 
                    results={searchResults} 
                    onSelect={handleProductSelect} 
                    selectedProduct={selectedProduct}
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
