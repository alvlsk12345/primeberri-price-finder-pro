
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";

export const NoResultsMessage: React.FC = () => {
  const { hasSearched, searchResults, isLoading } = useSearch();

  if (!hasSearched || searchResults.length > 0 || isLoading) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-center gap-2 text-amber-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>По вашему запросу ничего не найдено. Пожалуйста, проверьте запрос или попробуйте позже.</p>
      </div>
    </div>
  );
};
