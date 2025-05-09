import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchForm } from "@/components/SearchForm";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { NoResultsMessage } from "@/components/search/NoResultsMessage";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
import { useSearch } from "@/contexts/search";
import { isSearchEngineLink } from "@/services/url";

export const SearchContainer: React.FC = () => {
  const { searchQuery, setSearchQuery, handleSearch, isLoading, searchResults } = useSearch();

  // Добавляем отладочную информацию при изменении результатов поиска
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      // Проверяем ссылки на поисковые системы
      const searchLinksCount = searchResults.filter(product => 
        product.link && isSearchEngineLink(product.link)
      ).length;
      
      console.log(`Получены результаты поиска: всего ${searchResults.length}, из них ${searchLinksCount} с поисковыми ссылками`);
      
      // Показываем детали для первых двух результатов
      searchResults.slice(0, 2).forEach((product, idx) => {
        console.log(`Товар ${idx + 1}: ${product.title}`);
        console.log(`  Источник: ${product.source}`);
        console.log(`  Ссылка: ${product.link || 'отсутствует'}`);
        console.log(`  Это поисковая ссылка: ${product.link ? isSearchEngineLink(product.link) : 'нет ссылки'}`);
      });
    }
  }, [searchResults]);

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

          <NoResultsMessage />
          <SearchResultsSection />
          <ProductDetailsSection />
        </div>
      </CardContent>
    </Card>
  );
};
