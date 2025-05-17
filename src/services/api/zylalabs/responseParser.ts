
import { SearchParams, Product } from "../../types";
import { formatSingleProduct } from "../../formatters/singleProductFormatter";
import { parseApiResponse } from "../responseParserService";

// Обнаруженные форматы ответов API Zylalabs
export enum ZylalabsResponseFormat {
  STANDARD = 'standard',           // { data: { products: [...] } }
  LEGACY = 'legacy',               // { products: [...] }
  ARRAY = 'array',                 // [ {...}, {...} ]
  STATUS_OK = 'status_ok',         // { status: "OK", data: { products: [...] } }
  EMPTY = 'empty',                 // {}
  ERROR = 'error',                 // { status: "ERROR", message: "..." }
  UNKNOWN = 'unknown'              // Неопознанный формат
}

// Улучшенная функция парсинга ответа API
export const parseResponse = async (data: any, originalQuery: string | SearchParams) => {
  // Получаем строку запроса
  const query = typeof originalQuery === 'string' ? originalQuery : originalQuery.query;
  
  console.log('Начинаем анализ ответа API Zylalabs для запроса:', query);
  
  // Если данные отсутствуют, сразу возвращаем ошибку
  if (!data) {
    console.error('API вернул пустой ответ (null или undefined)');
    return {
      products: [],
      totalPages: 0,
      isDemo: true,
      apiInfo: {
        error: 'API вернул пустой ответ',
        source: 'API Error'
      }
    };
  }

  // Логируем полную структуру ответа для отладки
  console.log('Полная структура ответа API:', typeof data, JSON.stringify(data).substring(0, 500) + '...');
  
  // Определяем формат ответа
  let responseFormat = ZylalabsResponseFormat.UNKNOWN;
  let productsArray: any[] = [];
  let totalResults = 0;
  let errorMessage = '';
  
  try {
    // Определяем формат ответа по структуре
    if (data.status === "ERROR") {
      responseFormat = ZylalabsResponseFormat.ERROR;
      errorMessage = data.message || 'Неизвестная ошибка API';
      console.error('API вернул ошибку:', errorMessage);
    } else if (data.data && Array.isArray(data.data.products)) {
      responseFormat = ZylalabsResponseFormat.STANDARD;
      productsArray = data.data.products;
      totalResults = data.data.total_results || data.data.total || productsArray.length;
    } else if (Array.isArray(data.products)) {
      responseFormat = ZylalabsResponseFormat.LEGACY;
      productsArray = data.products;
      totalResults = data.total_results || data.total || productsArray.length;
    } else if (Array.isArray(data)) {
      responseFormat = ZylalabsResponseFormat.ARRAY;
      productsArray = data;
      totalResults = productsArray.length;
    } else if (data.status === "OK" && data.data && Array.isArray(data.data.products)) {
      responseFormat = ZylalabsResponseFormat.STATUS_OK;
      productsArray = data.data.products;
      totalResults = data.data.total || productsArray.length;
    } else if (Object.keys(data).length === 0) {
      responseFormat = ZylalabsResponseFormat.EMPTY;
      console.warn('API вернул пустой объект');
    } else {
      // Пытаемся найти массив в любом поле объекта
      for (const key in data) {
        if (Array.isArray(data[key])) {
          console.log(`Найден массив в поле ${key}, количество элементов:`, data[key].length);
          if (data[key].length > 0) {
            productsArray = data[key];
            totalResults = productsArray.length;
            responseFormat = ZylalabsResponseFormat.UNKNOWN;
            break;
          }
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          for (const nestedKey in data[key]) {
            if (Array.isArray(data[key][nestedKey])) {
              console.log(`Найден вложенный массив в поле ${key}.${nestedKey}, количество элементов:`, data[key][nestedKey].length);
              if (data[key][nestedKey].length > 0) {
                productsArray = data[key][nestedKey];
                totalResults = productsArray.length;
                responseFormat = ZylalabsResponseFormat.UNKNOWN;
                break;
              }
            }
          }
        }
      }
    }
    
    console.log(`Определен формат ответа API: ${responseFormat}, найдено ${productsArray.length} товаров`);
    
    // При ошибке или отсутствии данных возвращаем пустой результат
    if (responseFormat === ZylalabsResponseFormat.ERROR || 
        responseFormat === ZylalabsResponseFormat.EMPTY ||
        productsArray.length === 0) {
      return {
        products: [],
        totalPages: 0,
        isDemo: true,
        apiInfo: {
          source: 'Zylalabs API',
          format: responseFormat,
          query,
          error: errorMessage || 'Нет данных в ответе API',
          originalStructure: JSON.stringify(data).substring(0, 200) + '...'
        }
      };
    }
    
    // Для валидного формата обрабатываем товары
    try {
      // Преобразуем товары в нужный формат с использованием formatSingleProduct
      const productsPromises = productsArray.map((item: any) => formatSingleProduct(item));
      const products = await Promise.all(productsPromises);
      
      console.log(`Успешно обработано ${products.length} товаров из ${productsArray.length} исходных`);
      
      return {
        products,
        totalPages: data.data?.totalPages || Math.ceil(totalResults / 10) || 1,
        isDemo: false,
        apiInfo: {
          source: 'Zylalabs API',
          format: responseFormat,
          query,
          totalResults: totalResults.toString()
        }
      };
    } catch (formatError) {
      console.error('Ошибка при форматировании товаров:', formatError);
      
      // В случае ошибки возвращаем упрощенную версию обработки
      const basicProducts = productsArray.map((item: any) => ({
        id: item.id || `product-${Math.random().toString(36).substring(7)}`,
        title: item.title || item.name || 'Unknown Product',
        price: parseFloat(item.price) || 0,
        currency: item.currency || 'EUR',
        image: item.image || item.img || item.thumbnail || '',
        description: item.description || '',
        rating: item.rating || 0,
        url: item.url || item.link || '',
        source: item.source || item.shop || 'Unknown',
        country: item.country || 'de',
        originalData: item
      }));
      
      return {
        products: basicProducts,
        totalPages: data.data?.totalPages || Math.ceil(totalResults / 10) || 1,
        isDemo: false,
        apiInfo: {
          source: 'Zylalabs API (basic parsing)',
          format: responseFormat,
          query,
          totalResults: totalResults.toString(),
          error: 'Ошибка при полной обработке товаров'
        }
      };
    }
  } catch (error) {
    console.error('Критическая ошибка при парсинге ответа API:', error);
    return {
      products: [],
      totalPages: 0,
      isDemo: true,
      apiInfo: {
        source: 'API Error',
        query,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка парсинга',
        originalStructure: JSON.stringify(data).substring(0, 200) + '...'
      }
    };
  }
};

// При необходимости можете добавить свою реализацию parseApiResponse
export const parseApiResponse = async (data: any, originalQuery: string | SearchParams) => {
  const query = typeof originalQuery === 'string' ? originalQuery : originalQuery.query;
  
  // Используем основную функцию parseResponse
  return parseResponse(data, query);
};
