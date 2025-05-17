
import { useRef } from 'react';
import { SearchParams } from "@/services/types";
import { searchEuProducts } from "@/services/api/zylalabs/euSearchService";
import { toast } from 'sonner';
import { clearApiCache } from '@/services/api/zylalabs/cacheService';

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
  // Ref для хранения ID таймаута
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Функция очистки таймаута
  const cleanupApiCall = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  // Функция для выполнения запроса к API
  const executeApiCall = async (params: SearchParams, forceNewSearch: boolean = false) => {
    try {
      console.log('Выполняем запрос к API с параметрами:', params, 'Принудительный поиск:', forceNewSearch);
      
      // Очищаем предыдущие таймауты
      cleanupApiCall();
      
      // Создаем новый таймаут для ограничения времени ожидания
      const resultPromise = new Promise<any>(async (resolve, reject) => {
        try {
          // Используем Zylalabs API для поиска продуктов в странах ЕС
          console.log('searchProductsViaZylalabs: Вызов с параметрами:', params);
          
          // Если запрошен принудительный поиск, очищаем кеш для этого запроса
          if (forceNewSearch) {
            console.log('Очистка кеша перед принудительным поиском');
            clearApiCache();
          }
          
          // Передаем параметр forceNewSearch в функцию searchEuProducts
          const result = await searchEuProducts(params.query, params.page || 1, forceNewSearch);
          
          // Проверяем результаты поиска
          if (result && result.products && result.products.length > 0) {
            console.log('Отрисовка списка товаров, количество:', result.products.length);
            
            // Устанавливаем флаг использования демо-данных и информацию об API
            setIsUsingDemoData(result.isDemo || false);
            setApiInfo(result.apiInfo);
            
            // Возвращаем результаты поиска
            resolve({
              products: result.products,
              totalPages: result.totalPages || 1,
              isDemo: result.isDemo || false,
              apiInfo: result.apiInfo,
              forceNewSearch // Добавляем флаг, чтобы отслеживать принудительные запросы
            });
          } else {
            console.log('Нет результатов поиска, возвращаем пустой массив');
            
            // Устанавливаем информацию об API
            setApiInfo(result.apiInfo);
            
            // Возвращаем пустой результат
            resolve({
              products: [],
              totalPages: 0,
              isDemo: false,
              apiInfo: result.apiInfo,
              forceNewSearch
            });
          }
        } catch (error) {
          console.error('Ошибка при выполнении запроса к API:', error);
          reject(error);
        }
      });
      
      // Ждем завершения промиса
      const searchResult = await resultPromise;
      
      // Возвращаем результат поиска
      return searchResult;
    } catch (error) {
      console.error('Критическая ошибка в executeApiCall:', error);
      
      // В случае ошибки возвращаем пустой результат
      setIsUsingDemoData(true);
      
      // Устанавливаем информацию об API
      setApiInfo({
        error: 'Критическая ошибка при выполнении запроса',
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      
      toast.error('Произошла ошибка при выполнении запроса к API', { 
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        duration: 5000
      });
      
      return {
        products: [],
        totalPages: 0,
        isDemo: true,
        apiInfo: {
          error: 'Критическая ошибка при выполнении запроса',
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      };
    }
  };

  return { executeApiCall, cleanupApiCall };
}
