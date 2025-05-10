
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
  
  // Улучшенная проверка наличия кешированных результатов для конкретного запроса и страницы
  const getCachedResults = (query: string, lastSearchQuery: string, page: number) => {
    // Проверяем точное совпадение запроса и наличие кеша для страницы
    const isSameQuery = query === lastSearchQuery;
    
    // Проверяем наличие и валидность кеша для указанной страницы
    if (isSameQuery && cachedResults[page] && cachedResults[page].length > 0) {
      console.log(`Кеш найден для страницы ${page}, запрос: "${query}"`);
      return cachedResults[page];
    } else if (isSameQuery) {
      console.log(`Кеш для страницы ${page} отсутствует или пуст. Доступные страницы: ${Object.keys(cachedResults).join(', ')}`);
    } else {
      console.log(`Запрос "${query}" отличается от предыдущего "${lastSearchQuery}", кеш не используется`);
    }
    
    return null;
  };
  
  // Улучшенная логика обработки ошибок поиска с использованием кеша
  const handleSearchFailure = (currentPage: number) => {
    // Если есть кеш для текущей страницы, используем его
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
    
    // Если ничего не нашли, но есть другие страницы в кеше
    const availablePages = Object.keys(cachedResults)
      .map(Number)
      .filter(pageNum => cachedResults[pageNum]?.length > 0);
    
    if (availablePages.length > 0) {
      // Берем ближайшую доступную страницу
      const closestPage = availablePages.reduce((prev, curr) => 
        Math.abs(curr - currentPage) < Math.abs(prev - currentPage) ? curr : prev
      );
      
      console.log(`При ошибке используем ближайшую доступную страницу ${closestPage}`);
      setSearchResults(cachedResults[closestPage]);
      setCurrentPage(closestPage);
      toast.info(`Переход к странице ${closestPage} из-за ошибки`, { duration: 3000 });
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
