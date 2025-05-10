
import { useState } from 'react';
import { SearchParams } from "@/services/types";
import { searchProductsViaZylalabs } from "@/services/api/zylalabsService";
import { toast } from "sonner";
import { API_TIMEOUT } from "@/services/api/mock/mockServiceConfig";

type SearchApiCallProps = {
  setIsLoading: (loading: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
};

export function useSearchApiCall({
  setIsLoading,
  setIsUsingDemoData,
  setApiInfo,
}: SearchApiCallProps) {
  // Таймаут для предотвращения слишком долгого запроса
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Функция выполнения поискового запроса к API
  const executeApiCall = async (searchParams: SearchParams) => {
    // Устанавливаем дополнительный внешний таймаут для контроля выполнения запроса
    const timeout = setTimeout(() => {
      setIsLoading(false);
      console.log('Поиск занял слишком много времени');
      toast.error('Поиск занял слишком много времени. Попробуйте еще раз или используйте другой запрос.', { duration: 5000 });
    }, API_TIMEOUT + 5000); // API_TIMEOUT + 5 секунд запаса
    
    setSearchTimeout(timeout);
    
    try {
      console.log('Выполняем запрос к API с параметрами:', searchParams);
      
      // Выполняем поисковый запрос
      const results = await searchProductsViaZylalabs(searchParams);
      
      console.log('Получен ответ от API:', results);
      
      // Проверяем, используются ли демо-данные
      if (results.isDemo) {
        console.log('Используются демо-данные');
        setIsUsingDemoData(true);
        setApiInfo(undefined);
      } else if (results.apiInfo) {
        console.log('Используются данные API, информация:', results.apiInfo);
        setIsUsingDemoData(false);
        setApiInfo(results.apiInfo);
      }
      
      return results;
    } catch (error) {
      console.error('Ошибка при выполнении API-запроса:', error);
      throw error;
    } finally {
      if (searchTimeout !== null) {
        clearTimeout(timeout);
      }
    }
  };
  
  // Очистка таймаутов
  const cleanupApiCall = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };
  
  return {
    executeApiCall,
    cleanupApiCall
  };
}
