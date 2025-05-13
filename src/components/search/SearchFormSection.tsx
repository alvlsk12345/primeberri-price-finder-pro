
import React from 'react';
import { SearchForm } from "@/components/SearchForm";
import { useSearch } from "@/contexts/SearchContext";

export const SearchFormSection: React.FC = () => {
  const { searchQuery, setSearchQuery, handleSearch, isLoading } = useSearch();

  return (
    <SearchForm 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={() => handleSearch(1)}
      isLoading={isLoading}
    />
  );
};
