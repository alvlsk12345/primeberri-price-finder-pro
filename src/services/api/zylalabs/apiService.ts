
import { Product, SearchParams } from "../../types";
import { makeZylalabsApiRequest } from "./apiClient";
import { parseResponse } from "./responseParser";
import { calculatePageUrl } from "./urlBuilder";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useMockData } from "../mock/mockServiceConfig";

export async function fetchProductsAsync(searchParams: SearchParams) {
  try {
    // Проверяем, нужно ли использовать демо-данные
    if (useMockData()) {
      console.log('Используем демо-данные для запроса: ', searchParams.query);
      return generateMockSearchResults(searchParams.query, searchParams.page || 1);
    }

    // Реальный запрос к API
    console.log('Запрос к Zylalabs API с параметрами:', searchParams);
    
    // Формируем URL для запроса с учетом параметров
    const pageUrl = calculatePageUrl(searchParams);
    
    // Выполняем запрос к API
    const response = await makeZylalabsApiRequest(pageUrl);
    
    // Проверяем, что получены данные
    if (!response || !response.data) {
      console.error('Получен пустой ответ от API');
      return {
        products: [],
        totalPages: 0,
        isDemo: false,
        apiInfo: {
          error: 'Получен пустой ответ от API',
          source: 'API Error'
        }
      };
    }
    
    // Проверяем наличие товаров в ответе
    if (!response.data.products || !Array.isArray(response.data.products) || response.data.products.length === 0) {
      console.warn('API вернул 0 товаров, используем демо-данные');
      return generateMockSearchResults(searchParams.query, searchParams.page || 1);
    }
    
    // Парсинг и обработка полученных данных
    const parsedData = await parseResponse(response, searchParams);
    
    return {
      products: parsedData.products,
      totalPages: parsedData.totalPages,
      isDemo: Boolean(parsedData.isDemo), // Преобразуем в boolean
      apiInfo: parsedData.apiInfo
    };
    
  } catch (error) {
    console.error('Ошибка при получении данных от API:', error);
    
    // В случае ошибки используем демо-данные
    console.warn('Из-за ошибки API используем демо-данные');
    return generateMockSearchResults(searchParams.query, searchParams.page || 1);
  }
}

// Экспортируем вспомогательные функции для тестирования
export const _testing = {
  parseResponse,
  makeZylalabsApiRequest,
  calculatePageUrl,
  generateMockSearchResults
};

