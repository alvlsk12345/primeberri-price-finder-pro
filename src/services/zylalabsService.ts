
import { toast } from "sonner";
import { SearchParams } from "./types";
import { searchProductsViaZylalabs as searchProductsViaZylalabsApi } from "./api/zylalabsService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('zylalabsService: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Проверка, что используется правильная конечная точка API
    console.log('Используется endpoint: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
    
    // Используем обновленную версию из API с указанием source=merchant
    const result = await searchProductsViaZylalabsApi(params);
    
    // Проверяем наличие результатов
    if (result && result.products && result.products.length > 0) {
      console.log(`zylalabsService: Получено ${result.products.length} товаров`);
      return result;
    } else {
      console.warn('zylalabsService: API вернул пустой результат');
      return result;
    }
  } catch (error) {
    console.error('Ошибка при вызове searchProductsViaZylalabsApi:', error);
    // Перехватываем все непредвиденные ошибки здесь, чтобы не прерывать работу приложения
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    return {
      products: [],
      totalPages: 0,
      isDemo: true,
      apiInfo: {}
    };
  }
};
