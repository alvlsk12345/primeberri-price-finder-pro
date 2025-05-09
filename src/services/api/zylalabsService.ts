
import { toast } from "sonner";
import { SearchParams } from "../types";
import { getMockSearchResults, useDemoModeForced } from "./mockDataService";
import { handleApiError, handleFetchError } from "./errorHandlerService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией,
// но в текущей реализации всегда возвращает демо-данные
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], total: number, isDemo: boolean, apiInfo?: Record<string, string>}> => {
  // Когда установлен режим принудительного использования демо-данных
  if (useDemoModeForced) {
    console.log('Принудительное использование демо-данных для запроса:', params.query);
    return getMockSearchResults(params.query);
  }

  // Код ниже не используется в текущей версии, но оставлен для будущей реализации
  try {
    console.log(`Возвращаем демо-данные вместо реального API-запроса`);
    return getMockSearchResults(params.query);
  } catch (error: any) {
    // Обрабатываем ошибки
    console.error('Ошибка при запросе к API:', error);
    toast.error('Не удалось подключиться к API. Используются демонстрационные данные.');
    
    // Всегда возвращаем демо-данные при ошибках
    return getMockSearchResults(params.query);
  }
};

