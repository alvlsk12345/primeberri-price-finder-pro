
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFormSection } from "@/components/search/SearchFormSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";

export const SearchContainer: React.FC = () => {
  return (
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
          <SearchFormSection />
          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </Card>
  );
};
