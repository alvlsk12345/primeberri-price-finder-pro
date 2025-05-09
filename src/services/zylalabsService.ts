
import { toast } from "sonner";
import { SearchParams } from "./types";
import { makeZylalabsApiRequest } from "./api/zylalabsConfig";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('Основной сервис: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Используем функцию из API сервиса
    const result = await makeZylalabsApiRequest(params);
    
    // Проверяем наличие результатов
    if (result && result.products && result.products.length > 0) {
      console.log(`Основной сервис: Получено ${result.products.length} товаров`);
      return result;
    } else {
      console.warn('Основной сервис: API вернул пустой результат');
      return result;
    }
  } catch (error) {
    console.error('Ошибка при вызове makeZylalabsApiRequest:', error);
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
