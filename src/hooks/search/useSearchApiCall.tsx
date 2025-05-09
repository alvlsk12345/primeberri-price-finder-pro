
import { useState } from 'react';
import { Product, ProductFilters, SearchParams } from "@/services/types";
import { searchProducts } from "@/services/productService";
import { toast } from "sonner";

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
  // Timeout reference to ensure we can cancel pending timeouts
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Функция выполнения поискового запроса к API
  const executeApiCall = async (searchParams: SearchParams) => {
    // Установка таймаута для предотвращения зависания поиска
    const timeout = setTimeout(() => {
      setIsLoading(false);
      console.log('Поиск занял слишком много времени');
      toast.error('Поиск занял слишком много времени. Попробуйте еще раз или используйте другой запрос.', { duration: 5000 });
    }, 35000); // 35 секунд таймаут
    
    setSearchTimeout(timeout);
    
    try {
      // Выполняем поисковый запрос
      const results = await searchProducts(searchParams);
      
      // Проверяем, используются ли демо-данные
      if (results.isDemo) {
        setIsUsingDemoData(true);
        // Reset API info when using demo data
        setApiInfo(undefined);
      } else if (results.apiInfo) {
        setIsUsingDemoData(false);
        // Update API info if available
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
  
  // Очистка таймаутов при размонтировании компонента
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
