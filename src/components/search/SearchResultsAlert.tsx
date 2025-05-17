
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResultsAlertProps {
  isUsingDemoData: boolean;
  apiInfo?: Record<string, string>;
  currentPage?: number; // Добавляем опциональный параметр currentPage
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ 
  isUsingDemoData, 
  apiInfo,
  currentPage = 1 // Используем значение по умолчанию
}) => {
  if (!isUsingDemoData) {
    return null;
  }

  // Создаем сообщение с учетом номера страницы
  const pageInfo = currentPage > 1 ? ` (страница ${currentPage})` : '';

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTitle className="flex items-center">
        <Bot className="h-4 w-4 mr-1" />
        Демо-режим{pageInfo}
      </AlertTitle>
      <AlertDescription>
        Результаты поиска сгенерированы локально, так как API не вернул данные.
        {apiInfo?.error && (
          <div className="mt-1 text-xs text-gray-600">
            <span className="font-semibold">Причина:</span> {apiInfo.error}
          </div>
        )}
        <div className="mt-2 text-xs">
          Для получения реальных результатов, пожалуйста, 
          <Link to="/settings" className="font-medium text-primary ml-1 hover:underline">
            добавьте API ключ
          </Link> 
          от <a 
            href="https://zylalabs.com/api/2033/real+time+product+search+api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Zylalabs
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};
