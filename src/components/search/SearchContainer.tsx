
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFormSection } from "@/components/search/SearchFormSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";

export const SearchContainer: React.FC = () => {
  return (
    <Card className="max-w-4xl mx-auto shadow-md border-brand/20">
      <CardHeader className="text-center bg-brand/10 rounded-t-md">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <a href="https://primeberri.com/" target="_blank" rel="noopener noreferrer">
            
          </a>
          Ищите товары в магазинах Европы, выбирайте и заказывайте на Primeberri
        </CardTitle>
        <CardDescription>Кликнув "Заказать на Primeberri", вы получите скопированную ссылку для заказа</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <SearchFormSection />
          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </Card>
  );
};
