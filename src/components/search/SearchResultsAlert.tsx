
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getApiKey, ZYLALABS_API_KEY } from "@/services/api/zylalabsConfig";
import { useSearch } from "@/contexts/SearchContext";

interface SearchResultsAlertProps {
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage }) => {
  const { isUsingDemoData, apiInfo } = useSearch();
  
  // Получаем API ключ для отображения
  const apiKey = getApiKey() || 'Не указан';
  
  // Маскируем API ключ для безопасности (показываем первые 5 и последние 4 символа)
  const maskedKey = apiKey !== 'Не указан' && apiKey.length > 10 
    ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`
    : apiKey;
    
  // Если не используются демо-данные, не показываем уведомление
  if (!isUsingDemoData) return null;

  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="font-medium text-amber-800">Используются демонстрационные данные</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p>API Zylalabs временно недоступен (ошибка 503). Это может быть связано с:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Временной недоступностью сервиса Zylalabs</li>
          <li>Превышением лимита запросов</li>
          <li>Проблемами с API ключом</li>
        </ul>
        <p className="mt-2">Используемый API ключ: {maskedKey}</p>
        <p className="mt-2 text-xs">Для просмотра оставшихся запросов API, проверьте заголовок ответа 'X-Zyla-API-Calls-Monthly-Remaining'</p>
        <p className="mt-1 text-xs">Пробуем показать доступные демо-товары для вашего запроса. Попробуйте повторить запрос через несколько минут.</p>
      </AlertDescription>
    </Alert>
  );
};
