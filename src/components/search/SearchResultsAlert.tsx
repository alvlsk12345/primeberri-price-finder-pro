
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
          <p className="font-medium mb-1">Не удалось подключиться к API поиска</p>
          <p className="text-sm">Причины могут быть следующими:</p>
          <ul className="text-sm list-disc pl-5 mt-1">
            <li>Проблемы с соединением или CORS</li>
            <li>Ограничения API ключа или его неверное значение</li>
            <li>Временная недоступность сервера API</li>
            <li>Блокировка запросов браузером</li>
          </ul>
          <p className="text-sm mt-2">
            В данный момент отображаются демонстрационные данные. 
            Попробуйте использовать другой браузер или отключить блокировщики контента.
          </p>
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
