
import { SearchParams } from "../types";
import { handleApiError, handleFetchError } from "./errorHandlerService";
import { generateMockSearchResults } from "./mock/mockSearchGenerator";

// Базовый URL API
const BASE_URL = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";

// Тайм-аут запросов в миллисекундах
const REQUEST_TIMEOUT = 15000; // 15 секунд

// API ключ для Zylalabs
export const ZYLALABS_API_KEY = '';

// Получение API-ключа из локального хранилища
export const getApiKey = (): string | null => {
  return localStorage.getItem('zylalabs_api_key');
};

// Функция для формирования URL с параметрами
export const buildZylalabsUrl = (params: SearchParams): string => {
  // Формирование базового URL с основными параметрами
  const apiKey = getApiKey();
  const query = encodeURIComponent(params.query);
  
  // Формирование базового URL с параметрами
  let url = `${BASE_URL}?query=${query}&source=merchant`;
  
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

// Функция для выполнения запроса к API Zylalabs
export const makeZylalabsApiRequest = async (params: SearchParams): Promise<any> => {
  const apiKey = getApiKey();
  
  // Проверка наличия ключа API
  if (!apiKey) {
    console.log('Отсутствует API ключ, используем демо-данные');
    return generateMockSearchResults(params.query, params.page);
  }
  
  // Формирование URL запроса
  const url = buildZylalabsUrl(params);
  console.log('Запрос к API с URL:', url);
  
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
    return {
      products: data.products || [],
      totalPages: data.total_pages || 1,
      isDemo: false,
      apiInfo: {
        totalResults: data.total_results ? `${data.total_results}` : '0',
        searchTime: data.search_time ? `${data.search_time}s` : 'н/д',
        source: 'Zylalabs API'
      }
    };
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
