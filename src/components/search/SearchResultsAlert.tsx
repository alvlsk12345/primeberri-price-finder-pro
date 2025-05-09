
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";

type SearchResultsAlertProps = {
  apiErrorMode: boolean;
  currentPage: number;
};

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ 
  apiErrorMode, 
  currentPage 
}) => {
  if (apiErrorMode) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка API</AlertTitle>
        <AlertDescription>
          Произошла ошибка при запросе к API. Используются демонстрационные данные.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (currentPage > 1) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Информация о странице</AlertTitle>
        <AlertDescription>
          Вы просматриваете страницу {currentPage} результатов поиска.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
