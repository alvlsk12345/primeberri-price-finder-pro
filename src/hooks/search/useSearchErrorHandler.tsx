
import { useRef } from 'react';
import { Product } from "@/services/types";

type SearchErrorHandlerProps = {
  setSearchResults: (results: Product[]) => void;
};

export function useSearchErrorHandler({
  setSearchResults
}: SearchErrorHandlerProps) {
  // Сохраняем последние успешные результаты
  const lastSuccessfulResultsRef = useRef<Product[]>([]);

  // Функция для сохранения успешных результатов
  const saveSuccessfulResults = (results: Product[]) => {
    lastSuccessfulResultsRef.current = results;
  };

  // Функция для обработки ошибок поиска
  const handleSearchError = (error: any) => {
    console.error('Ошибка при выполнении поиска:', error);
    
    // Если есть сохраненные результаты, используем их
    if (lastSuccessfulResultsRef.current.length > 0) {
      console.log(`Восстанавливаем ${lastSuccessfulResultsRef.current.length} предыдущих результатов`);
      setSearchResults(lastSuccessfulResultsRef.current);
      return { 
        success: true, 
        products: lastSuccessfulResultsRef.current, 
        recovered: true 
      };
    }
    
    // В противном случае возвращаем пустой массив
    return { success: false, products: [], recovered: false };
  };

  return {
    handleSearchError,
    saveSuccessfulResults,
    lastSuccessfulResultsRef
  };
}
