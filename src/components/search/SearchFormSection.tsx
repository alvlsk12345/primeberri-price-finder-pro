
import React from 'react';
import { SearchForm } from "@/components/SearchForm";
import { useSearch } from "@/contexts/SearchContext";
import { SearchProvider } from "@/contexts/SearchContext";

export const SearchFormSection: React.FC = () => {
  return (
    <SearchProvider>
      <SearchFormContent />
    </SearchProvider>
  );
};

// Выделяем внутренний компонент, который использует хук useSearch
const SearchFormContent: React.FC = () => {
  const { searchQuery, setSearchQuery, handleSearch, isLoading } = useSearch();

  return (
    <SearchForm 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={() => handleSearch(1, true)}
      isLoading={isLoading}
    />
  );
};
