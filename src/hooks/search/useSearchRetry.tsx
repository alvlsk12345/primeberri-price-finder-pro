
import { useState } from 'react';
import { ProductFilters } from "@/services/types";
import { toast } from "sonner";

type SearchRetryOptions = {
  executeSearch: (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: ProductFilters, 
    getSearchCountries: () => string[],
    forceNewSearch?: boolean
  ) => Promise<any>;
  handleSearchError: (error: any) => any;
  maxRetries?: number;
  retryDelay?: number;
};

export function useSearchRetry({
  executeSearch,
  handleSearchError,
  maxRetries = 2,
  retryDelay = 1500
}: SearchRetryOptions) {
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Сбросить счетчик повторных попыток
  const resetRetryAttempts = (): void => {
    if (retryCount > 0) {
      console.log(`Сбрасываем счетчик повторных попыток с ${retryCount} на 0`);
      setRetryCount(0);
    }
  };
  
  // Выполнить поиск с повторными попытками при неудаче
  const executeSearchWithRetry = async (
    queryToUse: string,
    page: number,
    lastSearchQuery: string,
    filters: ProductFilters,
    getSearchCountries: () => string[],
    forceNewSearch: boolean = false
  ): Promise<any> => {
    try {
      // Попытка выполнить поиск
      const result = await executeSearch(queryToUse, page, lastSearchQuery, filters, getSearchCountries, forceNewSearch);
      
      // Если поиск успешен, сбрасываем счетчик и возвращаем результаты
      resetRetryAttempts();
      return result;
    } catch (error) {
      console.error('Ошибка при выполнении поиска:', error);
      
      // Проверяем, можно ли выполнить повторную попытку
      if (retryCount < maxRetries) {
        // Увеличиваем счетчик попыток
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        console.log(`Попытка ${newRetryCount} из ${maxRetries}, ожидание ${retryDelay}мс...`);
        
        // Показываем уведомление о повторной попытке
        toast.loading(`Повторная попытка ${newRetryCount}/${maxRetries} поиска...`, {
          id: 'retry-toast',
          duration: retryDelay + 1000
        });
        
        // Ждем указанное время перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Закрываем уведомление
        toast.dismiss('retry-toast');
        
        // Выполняем повторную попытку с принудительным поиском (игнорируя кеш)
        return executeSearch(queryToUse, page, lastSearchQuery, filters, getSearchCountries, true);
      } else {
        // Если достигнут лимит повторных попыток, сбрасываем счетчик
        console.log('Превышено количество попыток поиска, сбрасываем счетчик');
        toast.error('Не удалось выполнить поиск после нескольких попыток', { duration: 3000 });
        resetRetryAttempts();
        
        // Обрабатываем ошибку
        return handleSearchError(error);
      }
    }
  };
  
  return { executeSearchWithRetry, resetRetryAttempts, retryCount };
}
