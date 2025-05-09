
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchForm } from "@/components/SearchForm";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
import { ApiUsageIndicator } from "@/components/search/ApiUsageIndicator";
import { useSearch } from "@/contexts/search";

export const SearchContainer: React.FC = () => {
  const { searchQuery, setSearchQuery, handleSearch, isLoading } = useSearch();

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
          <SearchForm 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={() => handleSearch(1, true)}
            isLoading={isLoading}
          />
          
          <ApiUsageIndicator />

          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </Card>
  );
};
