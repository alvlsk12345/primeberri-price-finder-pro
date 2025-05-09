
import React from 'react';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SearchContainer } from "@/components/search/SearchContainer";

export const SearchContainerWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <SearchContainer />
    </ErrorBoundary>
  );
};
