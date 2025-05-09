
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface SearchResultsAlertProps {
  apiErrorMode: boolean;
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ 
  apiErrorMode,
  currentPage
}) => {
  // Если включен режим ошибки API
  if (apiErrorMode) {
    return (
      <Alert variant="warning" className="bg-amber-50 border-amber-300">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Внимание</AlertTitle>
        <AlertDescription className="text-amber-700">
          Не удалось подключиться к сервису поиска. Отображаются демонстрационные данные.
          Пожалуйста, повторите попытку позже или обратитесь в поддержку.
        </AlertDescription>
      </Alert>
    );
  }

  // Если отображается первая страница
  if (currentPage === 1) {
    return null;
  }

  // Для страниц с пагинацией
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Информация</AlertTitle>
      <AlertDescription className="text-blue-700">
        Вы просматриваете страницу {currentPage} результатов поиска. 
        Для возврата к первой странице используйте кнопки пагинации.
      </AlertDescription>
    </Alert>
  );
};
