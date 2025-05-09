import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFormSection } from "@/components/search/SearchFormSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
export const SearchContainer: React.FC = () => {
  return <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Ищите товары в магазинах Европы,
выбирайте и переходите на Primeberri для заказа</CardTitle>
        <CardDescription>Кликнув “Заказать на Primeberri”, вы получите скопированную ссылку для заказа</CardDescription>
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