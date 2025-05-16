
import { toast } from "sonner";
import { SearchParams } from "../../types";
import { makeZylalabsApiRequest } from "./apiClient";
import { parseApiResponse } from "./responseParser";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";

/**
 * Основная функция для поиска товаров через Zylalabs API
 * @param params Параметры поиска
 * @returns Результаты поиска товаров
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('apiService: searchProductsViaZylalabs вызван с параметрами:', params);
  try {
    // Проверка, что используется правильная конечная точка API
    console.log('Используется endpoint: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
    
    // Вызываем API напрямую без круговой зависимости
    const result = await makeZylalabsApiRequest(params);
    console.log('Получен ответ от API Zylalabs:', Object.keys(result));
    
    // Анализ и обработка структуры ответа
    return parseApiResponse(result, params.query);
  } catch (error) {
    console.error('Ошибка при вызове API:', error);
    toast.error('Произошла непредвиденная ошибка при поиске товаров');
    
    // В случае ошибки используем демо-данные
    const demoData = generateMockSearchResults(params.query, params.page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Ошибка при вызове API',
        source: 'Demo Data'
      }
    };
  }
};
