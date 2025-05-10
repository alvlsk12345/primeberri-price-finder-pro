
import { toast } from "sonner";
import { Product } from "@/services/types";

type SearchCacheProps = {
  cachedResults: {[page: number]: Product[]};
  setSearchResults: (results: Product[]) => void;
  setCurrentPage: (page: number) => void;
};

export function useSearchCache({
  cachedResults,
  setSearchResults,
  setCurrentPage
}: SearchCacheProps) {
  
  // Проверка наличия кешированных результатов для конкретного запроса и страницы
  // с улучшенной логикой проверки идентичности запросов
  const getCachedResults = (query: string, lastSearchQuery: string, page: number) => {
    // Проверяем точное совпадение запроса и наличие кеша для страницы
    const isSameQuery = query === lastSearchQuery;
    if (isSameQuery && cachedResults[page] && cachedResults[page].length > 0) {
      console.log(`Кеш найден для страницы ${page}, запрос: "${query}"`);
      return cachedResults[page];
    }
    
    console.log(`Кеш не найден для страницы ${page}, запрос: "${query}"`);
    return null;
  };
  
  // Улучшенная логика обработки ошибок поиска с использованием кеша
  const handleSearchFailure = (currentPage: number) => {
    // Проверяем наличие кеша для текущей страницы
    if (cachedResults[currentPage] && cachedResults[currentPage].length > 0) {
      console.log(`При ошибке используем кеш для текущей страницы ${currentPage}`);
      setSearchResults(cachedResults[currentPage]);
      return true;
    } 
    // Если нет кеша для текущей страницы, но есть для первой - возвращаемся к первой
    else if (cachedResults[1] && cachedResults[1].length > 0) {
      console.log('При ошибке возвращаемся к первой странице (есть кеш)');
      setSearchResults(cachedResults[1]);
      setCurrentPage(1);
      toast.info('Возврат к первой странице из-за ошибки', { duration: 3000 });
      return true;
    }
    
    console.log('Не найдено кешированных результатов для восстановления после ошибки');
    return false;
  };
  
  return {
    getCachedResults,
    handleSearchFailure
  };
}
