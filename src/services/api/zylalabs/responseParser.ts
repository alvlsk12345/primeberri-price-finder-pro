
import { toast } from "sonner";
import { SearchParams } from "../../types";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { mapProductsFromApi } from "./productMapper";

/**
 * Парсинг и анализ структуры ответа API
 * @param result Ответ от API Zylalabs
 * @param params Исходные параметры запроса
 * @returns Обработанные результаты поиска
 */
export const parseApiResponse = (result: any, params: SearchParams) => {
  // Проверяем структуру ответа - новая структура с data.data (массив)
  if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
    console.log(`API вернул данные в структуре data.data (массив), найдено ${result.data.data.length} товаров`);
    
    const products = mapProductsFromApi(result.data.data, params);
    
    // Возвращаем обработанные данные с оригинальной структурой ответа
    console.log(`responseParser: Обработано ${products.length} товаров из data.data (массив)`);
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
  // Проверяем структуру с data.products
  else if (result && result.data && result.data.products && Array.isArray(result.data.products)) {
    console.log(`API вернул данные в структуре с data.products, найдено ${result.data.products.length} товаров`);
    
    const products = mapProductsFromApi(result.data.products, params);
    
    console.log(`responseParser: Обработано ${products.length} товаров из data.products`);
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
  // Проверка оригинального формата ответа (без вложенного data)
  else if (result && result.products && Array.isArray(result.products)) {
    console.log(`API вернул данные в оригинальном формате, найдено ${result.products.length} товаров`);
    
    // Модифицируем каждый продукт для правильного определения источника
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
    // Логирование структуры ответа
    console.warn('responseParser: Необработанная структура ответа API:', result);
    console.warn('Типы полей результата:', 
      Object.entries(result || {}).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? 'Array' : typeof value}`
      ));
    
    // Попытка найти продукты в любой структуре
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
