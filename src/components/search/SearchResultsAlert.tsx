
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCw, ExternalLink } from "lucide-react";
import { getApiKey, ZYLALABS_API_KEY } from "@/services/api/zylalabs";
import { useSearch } from "@/contexts/SearchContext";
import { useDemoModeForced } from "@/services/api/mock/mockServiceConfig";
import { Button } from "@/components/ui/button";

interface SearchResultsAlertProps {
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage }) => {
  const { isUsingDemoData, apiInfo, handleSearch } = useSearch();
  
  // Получаем API ключ для отображения
  const apiKey = getApiKey() || 'Не указан';
  
  // Маскируем API ключ для безопасности (показываем первые 5 и последние 4 символа)
  const maskedKey = apiKey !== 'Не указан' && apiKey.length > 10 
    ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`
    : apiKey;

  // Не показываем алерт, если все в порядке
  if (!isUsingDemoData) return null;
  
  // Функция для повторной попытки поиска
  const handleRetry = () => {
    handleSearch(currentPage, true); // Принудительно выполняем новый поиск
  };

  return (
    <Alert className="mb-4 border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="font-medium text-red-800">
        Ошибка доступа к API Zylalabs
      </AlertTitle>
      <AlertDescription className="text-red-700">
        <p>API Zylalabs временно недоступен. Это может быть связано с:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Временной недоступностью сервиса Zylalabs</li>
          <li>Превышением лимита запросов</li>
          <li>Проблемами с API ключом</li>
          <li>Ограничениями CORS</li>
        </ul>
        <p className="mt-2">Используемый API ключ: {maskedKey}</p>
        {apiInfo && apiInfo.remainingCalls && (
          <p className="mt-2 text-sm">Оставшиеся запросы API: {apiInfo.remainingCalls}</p>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRetry}
            className="flex items-center gap-1 text-red-800 border-red-400 hover:bg-red-100"
          >
            <RotateCw className="h-3 w-3" /> Повторить запрос
          </Button>
          <a 
            href="https://zylalabs.com/api/2033/real+time+product+search+api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 text-red-800 border border-red-400 rounded hover:bg-red-100"
          >
            <ExternalLink className="h-3 w-3" /> API документация
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};
