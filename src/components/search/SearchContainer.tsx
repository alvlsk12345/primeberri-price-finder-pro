
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SearchForm } from "@/components/SearchForm";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
import { useSearch } from "@/contexts/SearchContext";

export const SearchContainer: React.FC = () => {
  const { searchQuery, setSearchQuery, handleSearch, isLoading } = useSearch();

  return (
    <div className="max-w-4xl mx-auto rounded-2xl bg-white shadow-md overflow-hidden">
      <div className="p-8 text-center bg-gradient-to-r from-brand-blue to-brand-lightBlue">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
          Узнайте, сколько вы сэкономите на товаре из Европы и США
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Найдите товар, и мы покажем, сколько вы можете сэкономить при доставке в Россию
        </p>
      </div>
      
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <SearchForm 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={() => handleSearch(1, true)}
            isLoading={isLoading}
          />

          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </div>
  );
};
