
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ZYLALABS_API_KEY } from "@/services/api/zylalabsConfig";

interface SearchResultsAlertProps {
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage }) => {
  // Mask the API key for security (show first 5 and last 4 characters)
  const maskedKey = ZYLALABS_API_KEY.length > 10 
    ? `${ZYLALABS_API_KEY.substring(0, 5)}...${ZYLALABS_API_KEY.substring(ZYLALABS_API_KEY.length - 4)}`
    : "Не указан";

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
      </AlertDescription>
    </Alert>
  );
};
