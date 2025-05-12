
import { useRef } from 'react';
import { Product } from "@/services/types";
import { toast } from "sonner";

const MAX_RETRY_ATTEMPTS = 2;

type SearchRetryProps = {
  executeSearch: (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: any,
    getSearchCountries: () => string[]
  ) => Promise<any>;
  handleSearchError: (error: any) => {success: boolean, products: Product[], recovered?: boolean};
};

export function useSearchRetry({
  executeSearch,
  handleSearchError
}: SearchRetryProps) {
  // Счетчик попыток повторных запросов
  const retryAttemptsRef = useRef<number>(0);
  
  // Функция выполнения поиска с автоматическими повторными попытками
  const executeSearchWithRetry = async (
    queryToUse: string, 
    page: number, 
    lastSearchQuery: string, 
    filters: any,
    getSearchCountries: () => string[]
  ) => {
    try {
      // Выполняем поиск с четким указанием страницы
      console.log(`Выполняем поиск для запроса "${queryToUse}", страница: ${page}`);
      return await executeSearch(
        queryToUse,
        page,
        lastSearchQuery,
        filters,
        getSearchCountries
      );
    } catch (error) {
      // Повтор запроса при ошибке сети или таймауте
      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        console.log(`Ошибка при поиске. Повторная попытка ${retryAttemptsRef.current} из ${MAX_RETRY_ATTEMPTS}`);
        toast.info(`Повторный запрос (попытка ${retryAttemptsRef.current})...`, { duration: 2000 });
        
        // Задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          // Рекурсивный вызов для повторной попытки
          return await executeSearchWithRetry(queryToUse, page, lastSearchQuery, filters, getSearchCountries);
        } catch (retryError) {
          console.error('Повторная попытка не удалась:', retryError);
          return handleSearchError(retryError);
        }
      } else {
        // Исчерпаны все попытки
        retryAttemptsRef.current = 0;
        return handleSearchError(error);
      }
    }
  };

  // Сброс счетчика попыток
  const resetRetryAttempts = () => {
    retryAttemptsRef.current = 0;
  };

  return {
    executeSearchWithRetry,
    resetRetryAttempts
  };
}
