
import { useState, useCallback } from 'react';
import { toast } from "sonner";

export type UseSearchRetryProps = {
  maxRetries?: number;
  retryDelay?: number;
};

export function useSearchRetry(props: UseSearchRetryProps = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = props;
  const [retryCount, setRetryCount] = useState(0);
  
  // Сброс счетчика попыток
  const resetRetryAttempts = useCallback(() => {
    setRetryCount(0);
  }, []);
  
  // Функция для повторного выполнения запроса с задержкой
  const executeSearchWithRetry = useCallback(async (
    queryToUse: string,
    page: number,
    lastSearchQuery: string,
    filters: any,
    getSearchCountries: () => string[]
  ) => {
    if (retryCount < maxRetries) {
      // Увеличиваем счетчик попыток
      setRetryCount(prev => prev + 1);
      
      // Показываем уведомление о повторной попытке
      const currentAttempt = retryCount + 1;
      toast.info(`Повторная попытка поиска (${currentAttempt}/${maxRetries})...`, {
        duration: retryDelay,
        id: 'retry-toast'
      });
      
      // Ждем указанное время перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Информируем о повторной попытке и выполняем запрос
      console.log(`Выполняем повторную попытку ${currentAttempt}/${maxRetries} для запроса: ${queryToUse}`);
      
      return {
        queryToUse,
        page,
        lastSearchQuery,
        filters,
        getSearchCountries
      };
    } else {
      console.error(`Превышено максимальное количество попыток (${maxRetries}) для запроса: ${queryToUse}`);
      toast.error(`Не удалось выполнить поиск после ${maxRetries} попыток`, {
        description: "Попробуйте изменить запрос или повторите позже",
        duration: 5000
      });
      return null;
    }
  }, [retryCount, maxRetries, retryDelay]);
  
  return {
    executeSearchWithRetry,
    resetRetryAttempts
  };
}
