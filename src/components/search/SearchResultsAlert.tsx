
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCw } from "lucide-react";
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
  
  // Проверяем, активирован ли принудительный демо-режим
  const isDemoForced = useDemoModeForced;
  
  // Если не используются демо-данные и не активирован принудительный демо-режим, не показываем уведомление
  if (!isUsingDemoData && !isDemoForced) return null;
  
  // Функция для повторной попытки поиска
  const handleRetry = () => {
    handleSearch(currentPage, true); // Принудительно выполняем новый поиск
  };

  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="font-medium text-amber-800">
        {isDemoForced 
          ? "Активирован принудительный демо-режим" 
          : "Используются демонстрационные данные"}
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        {isDemoForced ? (
          <>
            <p>Демо-режим активирован в настройках приложения. API Zylalabs не используется.</p>
            <p className="mt-2 text-sm">Для отключения демо-режима измените параметр <code>useDemoModeForced</code> в файле <code>mockServiceConfig.ts</code>.</p>
          </>
        ) : (
          <>
            <p>API Zylalabs временно недоступен. Это может быть связано с:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Временной недоступностью сервиса Zylalabs</li>
              <li>Превышением лимита запросов</li>
              <li>Проблемами с API ключом</li>
              <li>Неверной обработкой структуры ответа API</li>
            </ul>
            <p className="mt-2">Используемый API ключ: {maskedKey}</p>
            {apiInfo && apiInfo.remainingCalls && (
              <p className="mt-2 text-sm">Оставшиеся запросы API: {apiInfo.remainingCalls}</p>
            )}
            <div className="mt-3 flex justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetry}
                className="flex items-center gap-1 text-amber-800 border-amber-400 hover:bg-amber-100"
              >
                <RotateCw className="h-3 w-3" /> Повторить запрос
              </Button>
            </div>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};
