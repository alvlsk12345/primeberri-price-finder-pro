
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsAlertProps {
  currentPage: number;
  apiErrorMode?: boolean;
  onRetry?: () => void;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ 
  currentPage, 
  apiErrorMode = false,
  onRetry 
}) => {
  if (apiErrorMode) {
    return (
      <Alert className="mb-4 border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-700">Проблема с подключением к API</AlertTitle>
        <AlertDescription className="text-red-700">
          <p className="font-medium mb-1">Не удалось подключиться к API поиска</p>
          <p className="text-sm">Причины могут быть следующими:</p>
          <ul className="text-sm list-disc pl-5 mt-1">
            <li>Проблемы с соединением или CORS</li>
            <li>Временная недоступность API Zylalabs (503 Service Unavailable)</li>
            <li>Ограничения API ключа или его устаревание</li>
            <li>Временная недоступность прокси-серверов</li>
          </ul>
          <p className="text-sm mt-2 font-medium">В данный момент отображаются демонстрационные данные. Попробуйте:</p>
          <ul className="text-sm list-disc pl-5 mt-1">
            <li>Обновить страницу</li>
            <li>Проверить ваше интернет-соединение</li>
            <li>Проверить актуальность API-ключа в настройках</li>
          </ul>
          {onRetry && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
              >
                <RefreshCcw size={14} />
                Повторить запрос
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        Возможны проблемы при загрузке данных для страницы {currentPage}. 
        Для полного результата попробуйте повторить поиск позже.
      </AlertDescription>
    </Alert>
  );
};
