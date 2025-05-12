
// Переделанная упрощенная версия - использует поиск по странам ЕС
import { SearchParams } from "../types";
import { makeZylalabsApiRequest } from "./zylalabs/apiClient";
import { parseApiResponse } from "./zylalabs/responseParser";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";
import { searchEuProducts } from "./zylalabs/euSearchService";

/**
 * Основная функция для поиска товаров через Zylalabs API
 * @param params Параметры поиска
 * @returns Результаты поиска товаров
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('searchProductsViaZylalabs: Вызов с параметрами:', params);
  try {
    // Используем новый подход поиска по странам ЕС, как в HTML-примере
    const results = await searchEuProducts(params.query, params.page);
    
    // Если найдены товары, возвращаем их
    if (results.products && results.products.length > 0) {
      console.log('Найдены товары в странах ЕС:', results.products.length);
      return results;
    }
    
    // Если товары не найдены, используем старый метод в качестве запасного варианта
    console.log('Товары не найдены в странах ЕС, попытка использования стандартного API запроса...');
    const result = await makeZylalabsApiRequest(params);
    
    if (result === null) {
      // При полном отсутствии результатов используем демо-данные
      console.log('Не удалось получить результаты API, использование демо-данных');
      
      const demoData = generateMockSearchResults(params.query, params.page);
      return {
        products: demoData.products,
        totalPages: demoData.totalPages || 1,
        isDemo: true,
        apiInfo: {
          error: 'Ошибка при выполнении API запроса',
          source: 'Demo Data'
        }
      };
    }
    
    // Анализ и обработка структуры ответа
    return parseApiResponse(result, params);
  } catch (error) {
    console.error('Критическая ошибка при вызове API:', error);
    
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
