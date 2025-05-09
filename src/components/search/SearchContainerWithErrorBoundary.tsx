
import React from 'react';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SearchContainer } from "@/components/search/SearchContainer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const SearchContainerWithErrorBoundary: React.FC = () => {
  // Function to handle manual refresh when error occurs
  const handleReset = () => {
    window.location.reload(); // Hard reload as a last resort for recovery
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Произошла критическая ошибка в компоненте поиска
          </h3>
          <p className="text-red-700 mb-4">
            К сожалению, что-то пошло не так при работе с поиском товаров.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={handleReset}
              variant="destructive"
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      }
    >
      <SearchContainer />
    </ErrorBoundary>
  );
};
