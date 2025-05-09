
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SearchResultsAlertProps {
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage }) => {
  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        Проблемы при загрузке данных для страницы {currentPage}. 
        Используются демонстрационные данные. Ваш API ключ: 8112|xU0WDZ...btrM
      </AlertDescription>
    </Alert>
  );
};
