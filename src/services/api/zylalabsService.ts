
// Переделанная упрощенная версия - использует параллельные запросы к API
import { SearchParams } from "../types";
import { makeZylalabsApiRequest, makeParallelZylalabsRequests } from "./zylalabs/apiClient";
import { parseApiResponse } from "./zylalabs/responseParser";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";
import { searchEuProducts } from "./zylalabs/euSearchService";

// Приоритетные страны ЕС для поиска
const EU_PRIORITY_COUNTRIES = ['de', 'fr', 'it', 'nl', 'es', 'pl', 'be'];
const SECONDARY_COUNTRIES = ['at', 'se', 'dk', 'ie', 'pt'];

/**
 * Основная функция для поиска товаров через Zylalabs API
 * @param params Параметры поиска
 * @returns Результаты поиска товаров
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('searchProductsViaZylalabs: Вызов с параметрами:', params);
  try {
    // Извлекаем signal из параметров, если он есть
    const { signal, ...searchParams } = params;
    
    // Определяем страны для поиска
    const searchCountries = params.countries && params.countries.length > 0 
      ? params.countries 
      : EU_PRIORITY_COUNTRIES;
    
    console.log('Выполняем параллельный поиск по странам:', searchCountries);
    
    // Выполняем параллельные запросы для всех стран сразу с учетом signal
    const parallelResults = await makeParallelZylalabsRequests(
      params.query, 
      searchCountries,
      params.page,
      params.language || 'ru'
    );
    
    // Если найдены товары через параллельные запросы, возвращаем их
    if (parallelResults && parallelResults.data?.data?.products && parallelResults.data.data.products.length > 0) {
      console.log('Найдены товары через параллельные запросы:', parallelResults.data.data.products.length);
      return parseApiResponse(parallelResults, searchParams);
    }
    
    console.log('Через параллельные запросы товары не найдены, пробуем использовать существующие методы');
    
    // Используем новый подход поиска по странам ЕС, как в HTML-примере
    const results = await searchEuProducts(params.query, params.page);
    
    // Если найдены товары, возвращаем их
    if (results.products && results.products.length > 0) {
      console.log('Найдены товары через searchEuProducts:', results.products.length);
      return results;
    }
    
    // Если товары не найдены, используем старый метод в качестве запасного варианта
    console.log('Товары не найдены через searchEuProducts, пробуем стандартный API запрос...');
    const result = await makeZylalabsApiRequest({...searchParams, signal});
    
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
    return parseApiResponse(result, searchParams);
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

// Экспортируем приоритетные страны для доступа из других модулей
export const getPriorityEuCountries = () => EU_PRIORITY_COUNTRIES;
export const getSecondaryEuCountries = () => SECONDARY_COUNTRIES;
