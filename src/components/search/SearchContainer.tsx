
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFormSection } from "@/components/search/SearchFormSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";

export const SearchContainer: React.FC = () => {
  return <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <a href="https://primeberri.com/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/lovable-uploads/d8c27061-2512-430e-8d4b-3f4e2f580be1.png" 
              alt="Primeberri Logo" 
              className="h-7 w-auto"
            />
          </a>
          Ищите товары в магазинах Европы, выбирайте и заказывайте на Primeberri
        </CardTitle>
        <CardDescription>Кликнув "Заказать на Primeberri", вы получите скопированную ссылку для заказа</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <SearchFormSection />
          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </Card>;
};
