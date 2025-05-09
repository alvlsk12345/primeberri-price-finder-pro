
import { Product } from "@/services/types";
import { toast } from "sonner";

type SearchErrorHandlerProps = {
  lastSuccessfulResults: React.MutableRefObject<Product[]>;
  setSearchResults: (results: Product[]) => void;
};

export function useSearchErrorHandler({
  lastSuccessfulResults,
  setSearchResults,
}: SearchErrorHandlerProps) {
  
  // Функция обработки ошибок поиска
  const handleSearchError = (error: any): { success: boolean, products: Product[], recovered?: boolean } => {
    console.error('Ошибка поиска:', error);
    
    if (lastSuccessfulResults.current.length > 0) {
      // В случае ошибки возвращаем последние успешные результаты
      console.log('Произошла ошибка при поиске, возвращаем предыдущие результаты');
      setSearchResults(lastSuccessfulResults.current);
      return { success: true, products: lastSuccessfulResults.current, recovered: true };
    }
    
    return { success: false, products: [], error };
  };
  
  // Функция для отображения сообщений об ошибках пользователю
  const showErrorMessage = (message: string) => {
    toast.error(message, { duration: 4000 });
  };
  
  return {
    handleSearchError,
    showErrorMessage
  };
}
