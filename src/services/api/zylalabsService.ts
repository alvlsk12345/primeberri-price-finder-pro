
import { toast } from "sonner";
import { SearchParams } from "../types";
import { getMockSearchResults, useDemoModeForced } from "./mockDataService";
import { handleApiError, handleFetchError } from "./errorHandlerService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией,
// но в текущей реализации всегда возвращает демо-данные
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('searchProductsViaZylalabs called with page:', params.page);
  
  // Когда установлен режим принудительного использования демо-данных
  if (useDemoModeForced) {
    console.log('Принудительное использование демо-данных для запроса:', params.query, 'страница:', params.page);
    // Добавим небольшую задержку для имитации запроса (не более 500мс)
    await new Promise(resolve => setTimeout(resolve, 500));
    const results = await getMockSearchResults(params.query);
    return {
      ...results,
      totalPages: Math.ceil((results.total || results.products.length) / 9),
      apiInfo: {}
    };
  }

  // Код ниже не используется в текущей версии, но оставлен для будущей реализации
  try {
    console.log(`Возвращаем демо-данные вместо реального API-запроса для страницы ${params.page}`);
    // В демонстрационном режиме нет информации от API, 
    // но структура объекта должна соответствовать
    const mockResults = await getMockSearchResults(params.query);
    // Добавляем пустой объект apiInfo для совместимости
    return {
      ...mockResults,
      totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
      apiInfo: {}
    };
  } catch (error: any) {
    // Обрабатываем ошибки
    console.error('Ошибка при запросе к API:', error);
    toast.error('Не удалось подключиться к API. Используются демонстрационные данные.');
    
    // Всегда возвращаем демо-данные при ошибках
    const mockResults = await getMockSearchResults(params.query);
    return {
      ...mockResults,
      totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
      apiInfo: {}
    };
  }
};
