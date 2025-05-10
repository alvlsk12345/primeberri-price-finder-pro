
// Переделанная упрощенная версия - реэкспортирует из основного модуля
import { SearchParams } from "../types";
import { toast } from "sonner";
import { makeZylalabsApiRequest } from "./zylalabs/apiClient";
import { parseApiResponse } from "./zylalabs/responseParser";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";

/**
 * Основная функция для поиска товаров через Zylalabs API
 * @param params Параметры поиска
 * @returns Результаты поиска товаров
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('searchProductsViaZylalabs: Вызов с параметрами:', params);
  try {
    // Выполняем запрос к API (с возможностью возврата демо-данных в случае ошибки)
    const result = await makeZylalabsApiRequest(params);
    console.log('Получен ответ от API Zylalabs:', Object.keys(result));
    
    // Анализ и обработка структуры ответа
    return parseApiResponse(result, params);
  } catch (error) {
    console.error('Критическая ошибка при вызове API:', error);
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    
    // При любой ошибке возвращаем демо-данные
    const demoData = generateMockSearchResults(params.query, params.page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Критическая ошибка при вызове API',
        source: 'Demo Data'
      }
    };
  }
};
