import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCw, ExternalLink, RefreshCw } from "lucide-react";
import { getApiKey, BASE_URL } from "@/services/api/zylalabs";
import { useSearch } from "@/contexts/SearchContext";
import { useDemoModeForced } from "@/services/api/mock/mockServiceConfig";
import { Button } from "@/components/ui/button";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";
import { toast } from "sonner";

interface SearchResultsAlertProps {
  currentPage: number;
}

export const SearchResultsAlert: React.FC<SearchResultsAlertProps> = ({ currentPage }) => {
  const { isUsingDemoData, apiInfo, handleSearch } = useSearch();
  
  // Состояние для хранения API ключа после получения
  const [apiKey, setApiKey] = useState<string>('Загрузка...');
  const [maskedKey, setMaskedKey] = useState<string>('Загрузка...');
  const [error, setError] = useState<string | null>(null);
  
  // Получаем API ключ асинхронно
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey() || 'Не указан';
        setApiKey(key);
        
        // Маскируем API ключ для безопасности (показываем первые 5 и последние 4 символа)
        if (key !== 'Не указан' && key.length > 10) {
          setMaskedKey(`${key.substring(0, 5)}...${key.substring(key.length - 4)}`);
        } else {
          setMaskedKey(key);
        }
      } catch (error) {
        console.error('Ошибка при получении API ключа:', error);
        setApiKey('Ошибка загрузки');
        setMaskedKey('Ошибка загрузки');
      }
    };
    
    fetchApiKey();
    
    // Устанавливаем ошибку из apiInfo
    if (apiInfo && apiInfo.error) {
      setError(apiInfo.error);
    } else {
      setError(null);
    }
  }, [apiInfo]);

  // Не показываем алерт, если все в порядке
  if (!isUsingDemoData && !error) return null;
  
  // Функция для повторной попытки поиска
  const handleRetry = () => {
    handleSearch(currentPage, true); // Принудительно выполняем новый поиск
  };
  
  // Функция для очистки кеша API
  const handleClearCache = () => {
    const clearedItems = clearApiCache();
    toast.success(`Кеш API очищен: удалено ${clearedItems} элементов`, { duration: 3000 });
  };

  // Определяем тип сообщения об ошибке
  let errorTitle = 'Ошибка доступа к API Zylalabs';
  let errorType = 'api';
  
  if (error && error.includes('ERR_NAME_NOT_RESOLVED')) {
    errorTitle = 'Ошибка DNS-разрешения';
    errorType = 'dns';
  } else if (error && error.includes('CORS')) {
    errorTitle = 'Ошибка CORS-политики';
    errorType = 'cors';
  }

  return (
    <Alert className="mb-4 border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="font-medium text-red-800">
        {errorTitle}
      </AlertTitle>
      <AlertDescription className="text-red-700">
        <p>API Zylalabs временно недоступен. Это может быть связано с:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {errorType === 'dns' && (
            <li className="font-medium">Проблемой DNS-разрешения доменного имени API</li>
          )}
          {errorType === 'cors' && (
            <li className="font-medium">Ограничениями CORS-политики браузера</li>
          )}
          <li>Временной недоступностью сервиса Zylalabs</li>
          <li>Превышением лимита запросов</li>
          <li>Проблемами с API ключом</li>
          <li>Использованием закешированных данных</li>
        </ul>
        <p className="mt-2">Используемый API ключ: {maskedKey}</p>
        {apiInfo && apiInfo.remainingCalls && (
          <p className="mt-2 text-sm">Оставшиеся запросы API: {apiInfo.remainingCalls}</p>
        )}
        {error && (
          <p className="mt-2 text-sm border-t border-red-200 pt-2">Сообщение об ошибке: {error.substring(0, 100)}{error.length > 100 ? '...' : ''}</p>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleClearCache}
            className="flex items-center gap-1 text-red-800 border-red-400 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" /> Очистить кеш API
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRetry}
            className="flex items-center gap-1 text-red-800 border-red-400 hover:bg-red-100"
          >
            <RotateCw className="h-3 w-3" /> Повторить запрос
          </Button>
          <a 
            href="https://zylalabs.com/api/2033/real-time-product-search-api" 
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
