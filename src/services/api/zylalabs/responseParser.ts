
import { toast } from "sonner";
import { SearchParams } from "../../types";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { mapProductsFromApi } from "./productMapper";

/**
 * Парсинг и анализ структуры ответа API Zylalabs, адаптирован из рабочего HTML-примера
 * @param result Ответ от API Zylalabs
 * @param params Исходные параметры запроса
 * @returns Обработанные результаты поиска
 */
export const parseApiResponse = (result: any, params: SearchParams) => {
  // Обработка ошибок в ответе
  if (result.error) {
    console.error('Ошибка при запросе к API:', result.error);
    const demoData = generateMockSearchResults(params.query, params.page);
    toast.error(`Ошибка API: ${result.error}`);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: result.error,
        source: 'Demo Data'
      }
    };
  }

  // Проверка формата из HTML-примера: result.data.status === "OK" и result.data.data.products
  if (result && result.data && result.data.status === "OK" && result.data.data && result.data.data.products) {
    console.log(`API вернул данные в формате HTML-примера (status: OK), найдено ${result.data.data.products.length} товаров`);
    
    const products = mapProductsFromApi(result.data.data.products, params);
    
    return {
      products: products,
      totalPages: result.data.data.total_pages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: result.data.data.total_results ? `${result.data.data.total_results}` : '0',
        searchTime: result.data.data.search_time ? `${result.data.data.search_time}s` : 'н/д',
        source: 'Zylalabs API',
        remainingCalls: result.remainingCalls || 'н/д'
      }
    };
  }
  // Проверка структуры с data.data (массив) - встречается в API
  else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
    console.log(`API вернул данные в структуре data.data (массив), найдено ${result.data.data.length} товаров`);
    
    const products = mapProductsFromApi(result.data.data, params);
    
    return {
      products: products,
      totalPages: result.data.total_pages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: result.data.total_results ? `${result.data.total_results}` : '0',
        searchTime: result.data.search_time ? `${result.data.search_time}s` : 'н/д',
        source: 'Zylalabs API',
        remainingCalls: result.remainingCalls || 'н/д'
      }
    };
  }
  // Проверка структуры с data.products
  else if (result && result.data && result.data.products && Array.isArray(result.data.products)) {
    console.log(`API вернул данные в структуре с data.products, найдено ${result.data.products.length} товаров`);
    
    const products = mapProductsFromApi(result.data.products, params);
    
    return {
      products: products,
      totalPages: result.data.total_pages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: result.data.total_results ? `${result.data.total_results}` : '0',
        searchTime: result.data.search_time ? `${result.data.search_time}s` : 'н/д',
        source: 'Zylalabs API',
        remainingCalls: result.remainingCalls || 'н/д'
      }
    };
  } 
  // Проверка оригинального формата (без вложенного data)
  else if (result && result.products && Array.isArray(result.products)) {
    console.log(`API вернул данные в оригинальном формате, найдено ${result.products.length} товаров`);
    
    const products = mapProductsFromApi(result.products, params);
    
    return {
      products: products,
      totalPages: result.totalPages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: '?',
        searchTime: '?',
        source: 'Zylalabs API',
        remainingCalls: result.remainingCalls || 'н/д'
      }
    };
  } else {
    // Логирование структуры ответа для отладки
    console.warn('responseParser: Необработанная структура ответа API:', JSON.stringify(result).substring(0, 500) + '...');
    console.warn('Типы полей результата:', 
      Object.entries(result || {}).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? 'Array' : typeof value}`
      ));
    
    // Возвращаем демо-данные при неожиданном формате ответа
    const demoData = generateMockSearchResults(params.query, params.page);
    
    toast.error('Получена неожиданная структура ответа API. Используем демо-данные.');
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Неожиданная структура ответа API',
        source: 'Demo Data'
      }
    };
  }
};
