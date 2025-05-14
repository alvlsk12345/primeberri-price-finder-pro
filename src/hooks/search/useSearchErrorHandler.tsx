
import { Product } from "@/services/types";
import { toast } from "sonner";
import { useRef } from "react";

type SearchErrorHandlerProps = {
  setSearchResults: (results: Product[]) => void;
};

export function useSearchErrorHandler({
  setSearchResults,
}: SearchErrorHandlerProps) {
  // Создаем собственную ссылку внутри хука, вместо получения извне
  const lastSuccessfulResultsRef = useRef<Product[]>([]);
  
  // Функция обработки ошибок поиска
  const handleSearchError = (error: any): { success: boolean, products: Product[], recovered?: boolean } => {
    console.error('Ошибка поиска:', error);
    
    if (lastSuccessfulResultsRef.current.length > 0) {
      // В случае ошибки возвращаем последние успешные результаты
      console.log('Произошла ошибка при поиске, возвращаем предыдущие результаты');
      setSearchResults(lastSuccessfulResultsRef.current);
      return { success: true, products: lastSuccessfulResultsRef.current, recovered: true };
    }
    
    return { success: false, products: [] };
  };
  
  // Функция для отображения сообщений об ошибках пользователю
  const showErrorMessage = (message: string) => {
    toast.error(message, { duration: 4000 });
  };
  
  // Функция для сохранения успешных результатов
  const saveSuccessfulResults = (results: Product[]) => {
    lastSuccessfulResultsRef.current = results;
  };
  
  return {
    handleSearchError,
    showErrorMessage,
    saveSuccessfulResults,
    lastSuccessfulResultsRef
  };
}
