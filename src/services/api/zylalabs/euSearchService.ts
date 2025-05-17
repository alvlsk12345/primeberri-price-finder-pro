// euSearchService.ts
import { Product, SearchParams } from "../../types";
import { makeZylalabsApiRequest } from "./apiClient";
import { parseResponse } from "./responseParser";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useMockData } from "../mock/mockServiceConfig";

/**
 * Функция для поиска товаров в странах ЕС.
 * @param query Поисковый запрос.
 * @param page Номер страницы.
 * @param forceNewSearch Принудительно выполнить новый поиск (игнорировать кеш)
 * @returns Результаты поиска и общее количество страниц.
 */
export const searchEuProducts = async (query: string, page: number = 1, forceNewSearch: boolean = false): Promise<{ products: Product[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string> }> => {
  try {
    // Подготовка параметров для запроса к API
    const searchParams: SearchParams = {
      query: query,
      page: page,
      countries: ['de', 'fr', 'es', 'it'], // Список стран ЕС для поиска
      language: 'ru' // Указываем язык
    };

    // Выполняем запрос к API
    const apiResponse = await makeZylalabsApiRequest(searchParams, forceNewSearch);

    // Если API вернул данные, обрабатываем их
    if (apiResponse && apiResponse.products && apiResponse.products.length > 0) {
      const parsedData = await parseResponse(apiResponse, searchParams);
      return {
        products: parsedData.products,
        totalPages: parsedData.totalPages,
        isDemo: false,
        apiInfo: {
          source: 'Zylalabs API'
        }
      };
    } else {
      // Если API не вернул результаты, возвращаем демо-данные
      console.warn('API вернул 0 товаров, используем демо-данные');
      const demoData = generateMockSearchResults(query, page);
      return {
        products: demoData.products,
        totalPages: demoData.totalPages,
        isDemo: true,
        apiInfo: {
          error: 'API вернул 0 товаров',
          source: 'Demo Data'
        }
      };
    }
  } catch (error) {
    console.error('Ошибка при поиске товаров в странах ЕС:', error);
    // В случае ошибки возвращаем демо-данные
    const demoData = generateMockSearchResults(query, page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages,
      isDemo: true,
      apiInfo: {
        error: 'Ошибка при поиске товаров в странах ЕС',
        source: 'Demo Data'
      }
    };
  }
};
