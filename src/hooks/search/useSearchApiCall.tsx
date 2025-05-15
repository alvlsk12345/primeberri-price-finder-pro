
import { useState } from 'react';
import { SearchParams } from "@/services/types";
import { searchProductsViaZylalabs } from "@/services/api/zylalabsService";
import { searchProductsViaSelectedAI } from "@/services/api/aiSearchService";
import { toast } from "sonner";
import { getSelectedAIProvider, getProviderDisplayName } from "@/services/api/aiProviderService";

// Уменьшаем время таймаута для более быстрого поиска
const API_TIMEOUT = 20000; // 20 секунд вместо 30

type SearchApiCallProps = {
  setIsLoading: (loading: boolean) => void;
  setIsUsingDemoData: (usingDemo: boolean) => void;
  setApiInfo: (info: Record<string, string> | undefined) => void;
};

// Расширяем тип SearchParams из services/types.ts для использования внутри этого компонента
type ExtendedSearchParams = SearchParams & {
  requireAdvancedSearch?: boolean;
};

export function useSearchApiCall({
  setIsLoading,
  setIsUsingDemoData,
  setApiInfo,
}: SearchApiCallProps) {
  // Таймаут для предотвращения слишком долгого запроса
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Функция выполнения поискового запроса к API
  const executeApiCall = async (searchParams: ExtendedSearchParams) => {
    // Отменяем предыдущий таймаут, если он существует
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    
    // Явно устанавливаем загрузку в true
    setIsLoading(true);
    
    // Показываем toast о поиске
    toast.loading(`Выполняется поиск товаров...`, {
      id: 'search-progress',
      duration: API_TIMEOUT + 5000
    });
    
    // Создаем переменную для отслеживания актуального статуса загрузки
    let isCurrentlyLoading = true;
    
    // Устанавливаем новый таймаут
    const timeout = setTimeout(() => {
      // Проверяем, всё ещё идёт ли загрузка
      if (isCurrentlyLoading) {
        console.log('Поиск занял слишком много времени');
        toast.error('Поиск занял слишком много времени. Попробуйте еще раз или используйте другой запрос.', { duration: 5000 });
        setIsLoading(false);
      }
    }, API_TIMEOUT);
    
    setSearchTimeout(timeout);
    
    try {
      console.log('Выполняем запрос к API с параметрами:', searchParams);
      
      // ВАЖНОЕ ИЗМЕНЕНИЕ: Всегда используем Zylalabs для основного поиска
      // вместо выбранного AI провайдера
      let results = await searchProductsViaZylalabs(searchParams);
      
      console.log('Получен ответ от API:', results);
      
      // Отмечаем, что загрузка завершена
      isCurrentlyLoading = false;
      setIsLoading(false);
      
      // Скрываем toast загрузки
      toast.dismiss('search-progress');
      
      // Проверяем, используются ли демо-данные
      if (results.isDemo) {
        console.log('Используются демо-данные');
        setIsUsingDemoData(true);
        setApiInfo(undefined);
        
        // Показываем уведомление о демо-данных
        toast.info('Используются демонстрационные данные', { duration: 3000 });
      } else if (results.apiInfo) {
        console.log('Используются данные API, информация:', results.apiInfo);
        setIsUsingDemoData(false);
        setApiInfo(results.apiInfo);
      }
      
      // После получения результатов отменяем таймаут, чтобы избежать ложного сообщения
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      
      return results;
    } catch (error) {
      console.error('Ошибка при выполнении API-запроса:', error);
      
      // Отмечаем, что загрузка завершена (с ошибкой)
      isCurrentlyLoading = false;
      setIsLoading(false);
      
      // Скрываем toast загрузки
      toast.dismiss('search-progress');
      
      // Показываем toast об ошибке
      toast.error('Произошла ошибка при поиске товаров', { duration: 3000 });
      
      // Отменяем таймаут при ошибке
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      
      throw error;
    }
  };
  
  // Очистка таймаутов
  const cleanupApiCall = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    
    // Скрываем toast загрузки при очистке
    toast.dismiss('search-progress');
  };
  
  return {
    executeApiCall,
    cleanupApiCall
  };
}
