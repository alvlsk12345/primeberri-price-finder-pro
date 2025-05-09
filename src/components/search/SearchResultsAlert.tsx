
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SearchResultsAlertProps {
  currentPage: number;
  apiErrorMode?: boolean;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage, apiErrorMode = false }) => {
  if (apiErrorMode) {
    return (
      <Alert className="mb-4 border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Не удалось подключиться к API поиска. Отображаются демонстрационные данные. 
          Пожалуйста, проверьте подключение к интернету или повторите попытку позже.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        Возможны проблемы при загрузке данных для страницы {currentPage}. 
        Для полного результата попробуйте повторить поиск позже.
      </AlertDescription>
    </Alert>
  );
};
