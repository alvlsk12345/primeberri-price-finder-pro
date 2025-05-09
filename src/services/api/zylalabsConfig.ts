
import { SearchParams } from "../types";
import { handleApiError, handleFetchError } from "./errorHandlerService";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";
import { useDemoModeForced } from "./mock/mockServiceConfig";

// Базовый URL API
const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Увеличенный таймаут запросов в миллисекундах (с 45 до 60 секунд)
const REQUEST_TIMEOUT = 60000; // 60 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '8112|xU0WDZhKkWVo7rczutXwzGKzEwBtNPhHbsAYbtrM';

// Функция для автоматического сохранения API-ключа при первом запуске
const saveDefaultApiKey = () => {
  if (!localStorage.getItem('zylalabs_api_key')) {
    localStorage.setItem('zylalabs_api_key', ZYLALABS_API_KEY);
    console.log('API ключ Zylalabs автоматически сохранен в localStorage');
  }
};

// Вызываем функцию сохранения ключа при импорте модуля
saveDefaultApiKey();

// Получение API-ключа из локального хранилища или использование предустановленного ключа
export const getApiKey = (): string => {
  const storedKey = localStorage.getItem('zylalabs_api_key');
  // Если ключ есть в localStorage, используем его, иначе возвращаем предустановленный ключ
  return storedKey || ZYLALABS_API_KEY;
};

// Функция для формирования URL с параметрами
export const buildZylalabsUrl = (params: SearchParams): string => {
  // Формирование базового URL с основными параметрами
  const query = encodeURIComponent(params.query);
  
  // Формирование базового URL с параметрами
  // Используем 'q' вместо 'query' в соответствии с API
  let url = `${BASE_URL}?q=${query}&language=en`;
  
  // Добавляем номер страницы, если указан
  if (params.page && params.page > 1) {
    url += `&page=${params.page}`;
  }
  
  // Добавляем фильтры, если они указаны
  if (params.filters) {
    // Сортировка
    if (params.filters.sortBy) {
      url += `&sortBy=${params.filters.sortBy}`;
    }
    
    // Минимальная цена
    if (params.filters.minPrice) {
      url += `&minPrice=${params.filters.minPrice}`;
    }
    
    // Максимальная цена
    if (params.filters.maxPrice) {
      url += `&maxPrice=${params.filters.maxPrice}`;
    }
    
    // Минимальный рейтинг
    if (params.filters.rating) {
      url += `&minRating=${params.filters.rating}`;
    }
    
    // Бренды (если указаны)
    if (params.filters.brands && params.filters.brands.length > 0) {
      const brands = params.filters.brands.join(',');
      url += `&brand=${encodeURIComponent(brands)}`;
    }
  }
  
  // Добавляем страны поиска, если указаны
  if (params.countries && params.countries.length > 0) {
    url += `&country=${params.countries.join(',')}`;
  }
  
  return url;
};

// Кеш успешных ответов API (улучшенный)
const apiResponseCache: Record<string, {timestamp: number, data: any}> = {};
const CACHE_TTL = 7200000; // Увеличиваем TTL кеша до 2 часов (было 1 час)

// Функция для получения запроса из кеша
const getCachedResponse = (url: string) => {
  const cachedItem = apiResponseCache[url];
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
    console.log('Используем кешированные данные для URL:', url);
    return cachedItem.data;
  }
  return null;
};

// Функция для сохранения запроса в кеш
const setCacheResponse = (url: string, data: any) => {
  // Ограничиваем размер кеша (максимум 50 запросов)
  const cacheKeys = Object.keys(apiResponseCache);
  if (cacheKeys.length >= 50) {
    // Удаляем самый старый элемент кеша
    let oldestKey = cacheKeys[0];
    let oldestTime = apiResponseCache[oldestKey].timestamp;
    
    cacheKeys.forEach(key => {
      if (apiResponseCache[key].timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = apiResponseCache[key].timestamp;
      }
    });
    
    console.log('Кеш переполнен, удаляем самый старый элемент:', oldestKey);
    delete apiResponseCache[oldestKey];
  }
  
  apiResponseCache[url] = {
    timestamp: Date.now(),
    data
  };
  console.log('Данные сохранены в кеш для URL:', url);
};

// Функция для выполнения запроса к API Zylalabs
export const makeZylalabsApiRequest = async (params: SearchParams): Promise<any> => {
  // Проверка на принудительное использование демо-режима
  if (useDemoModeForced) {
    console.log('Принудительное использование демо-режима. Запрос API пропущен.');
    return generateMockSearchResults(params.query, params.page);
  }
  
  const apiKey = getApiKey();
  
  // Проверка наличия ключа API
  if (!apiKey) {
    console.log('Отсутствует API ключ, используем демо-данные');
    return generateMockSearchResults(params.query, params.page);
  }
  
  // Формирование URL запроса
  const url = buildZylalabsUrl(params);
  console.log('Запрос к API с URL:', url);
  
  // Проверяем кеш перед запросом
  const cachedResponse = getCachedResponse(url);
  if (cachedResponse) {
    return {
      ...cachedResponse,
      fromCache: true
    };
  }
  
  // Создание контроллера для отмены запроса по таймауту
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    // Выполнение запроса к API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    // Очистка таймера
    clearTimeout(timeoutId);
    
    // Проверка успешности запроса
    if (!response.ok) {
      // Обработка ошибки от API
      return handleApiError(response);
    }
    
    // Разбор ответа
    const data = await response.json();
    console.log('API вернул данные:', data);
    
    // Обработка ответа
    const result = {
      products: data.products || [],
      totalPages: data.total_pages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: data.total_results ? `${data.total_results}` : '0',
        searchTime: data.search_time ? `${data.search_time}s` : 'н/д',
        source: 'Zylalabs API',
        remainingCalls: response.headers.get('X-Zyla-API-Calls-Monthly-Remaining') || 'н/д'
      }
    };
    
    // Кешируем успешный результат
    setCacheResponse(url, result);
    
    return result;
  } catch (error) {
    // Очистка таймера
    clearTimeout(timeoutId);
    
    // Обработка ошибок сети и таймаутов
    handleFetchError(error);
    
    // Возврат демо-данных в случае ошибки
    console.log('Ошибка при запросе к API, используем демо-данные');
    return generateMockSearchResults(params.query, params.page);
  }
};
