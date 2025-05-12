
import { SearchParams } from "../../types";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey, REQUEST_TIMEOUT } from "./config";
import { buildZylalabsUrl } from "./urlBuilder";
import { toast } from "sonner"; 
import { getCachedResponse, setCacheResponse } from "./cacheService";

/**
 * Выполняет запрос к API Zylalabs, используя подход из рабочего HTML-примера
 * @param params Параметры поиска
 * @returns Результаты поиска или демо-данные в случае ошибки
 */
export const makeZylalabsApiRequest = async (params: SearchParams): Promise<any> => {
  // Проверка на принудительное использование демо-режима
  if (useDemoModeForced) {
    console.log('Принудительное использование демо-режима. Запрос API пропущен.');
    return generateMockSearchResults(params.query, params.page);
  }
  
  const apiKey = getApiKey();
  
  // Проверка наличия ключа API
  if (!apiKey) {
    console.error('Отсутствует API ключ');
    toast.error('Отсутствует API ключ для доступа к Zylalabs. Запрос невозможен.');
    throw new Error('API ключ не задан');
  }
  
  // Формирование URL запроса, используя точно такой же подход, как в рабочем HTML-примере
  const url = buildZylalabsUrl(params);
  console.log('Запрос к API с URL:', url);
  
  // Проверяем кэш перед выполнением запроса
  const cachedResponse = getCachedResponse(url);
  if (cachedResponse) {
    console.log('Используем кэшированные данные для запроса');
    return cachedResponse;
  }
  
  try {
    // Уменьшаем таймаут до 15 секунд для запросов к API (было 30)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд
    
    // Показываем уведомление о запросе
    toast.loading('Выполняется запрос к Zylalabs API...', {
      id: 'api-request',
      duration: 15000 // Соответствует уменьшенному таймауту
    });
    
    // Выполняем запрос с чёткими заголовками, как в HTML-примере
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    // Очищаем таймаут
    clearTimeout(timeoutId);
    
    // Завершаем уведомление о запросе
    toast.dismiss('api-request');
    
    // Проверка успешности запроса
    if (!response.ok) {
      console.error('Ошибка API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Тело ответа с ошибкой:', errorText);
      
      // Если сервис недоступен (503), показываем более мягкое сообщение
      if (response.status === 503) {
        toast.error('Сервис Zylalabs временно недоступен. Пробуем запрос с другими параметрами.');
        console.log('Сервис недоступен (503), пробуем выполнить запрос с другими параметрами');
        return null; // Вернем null, чтобы попробовать другие страны или запросы
      }
      
      throw new Error(`API вернул ошибку ${response.status}: ${response.statusText}`);
    }
    
    // Разбор ответа как текст, а затем JSON для лучшей отладки
    const responseText = await response.text();
    console.log('Получен ответ от API, длина:', responseText.length);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Структура ответа API:', Object.keys(data));
      
      // Обработка заголовков для получения лимитов API
      const remainingCalls = response.headers.get('X-Zyla-API-Calls-Monthly-Remaining') || 'н/д';
      
      // Проверяем структуру ответа, как в HTML-примере
      if (data.status === "OK" && data.data && data.data.products) {
        console.log('API вернул структуру с data.products, количество продуктов:', 
          data.data.products.length);
        
        // Кэшируем полученные данные перед возвратом
        const resultToCache = {
          data: data,
          totalPages: data.data.total_pages || 1,
          isDemo: false,
          remainingCalls: remainingCalls
        };
        
        // Сохраняем в кэш
        setCacheResponse(url, resultToCache);
        
        // Возвращаем полный ответ с метаданными
        return resultToCache;
      } else {
        console.warn('Нестандартная структура ответа API:', Object.keys(data));
        // Пытаемся вернуть данные в любом случае для дальнейшей обработки
        const resultToCache = {
          data: data,
          totalPages: data.total_pages || 1,
          isDemo: false,
          remainingCalls: remainingCalls
        };
        
        // Сохраняем в кэш
        setCacheResponse(url, resultToCache);
        
        return resultToCache;
      }
    } catch (jsonError) {
      console.error('Ошибка при парсинге JSON:', jsonError);
      console.log('Невалидный JSON в ответе:', responseText.substring(0, 200) + '...');
      throw new Error('Неверный формат JSON в ответе API');
    }
  } catch (error: any) {
    // Завершаем уведомление о запросе при ошибке
    toast.dismiss('api-request');
    
    // Проверка на ошибку таймаута
    if (error.name === 'AbortError') {
      console.error('Запрос был отменен из-за таймаута');
      toast.error('Превышен таймаут ожидания ответа от Zylalabs API', { duration: 3000 });
      return null; // Вернем null, чтобы попробовать другие страны или запросы
    } else {
      console.error('Ошибка при запросе к API:', error);
      toast.error(`Ошибка при запросе к API: ${error.message}`, { duration: 3000 });
    }
    
    // Если была критическая ошибка, вернем null для возможности попробовать другую страну
    return null;
  }
};

/**
 * Выполняет параллельные запросы к API Zylalabs для нескольких стран
 * @param query Поисковый запрос
 * @param countryCodes Массив кодов стран
 * @param page Номер страницы
 * @param language Код языка
 * @returns Комбинированные результаты поиска
 */
export const makeParallelZylalabsRequests = async (
  query: string,
  countryCodes: string[],
  page: number = 1,
  language: string = 'ru'
): Promise<any> => {
  console.log(`Выполняем параллельные запросы для ${countryCodes.length} стран:`, countryCodes);
  
  // Создаем массив промисов запросов для каждой страны
  const requests = countryCodes.map(countryCode => 
    makeZylalabsCountryRequest(query, countryCode, page, language)
      .catch(error => {
        console.warn(`Ошибка при запросе для страны ${countryCode}:`, error);
        return null; // Возвращаем null вместо ошибки для Promise.allSettled
      })
  );
  
  // Выполняем все запросы параллельно и получаем результаты
  const results = await Promise.allSettled(requests);
  
  // Обрабатываем результаты, игнорируя ошибки
  const validResults = results
    .filter((result): result is PromiseFulfilledResult<any> => 
      result.status === 'fulfilled' && result.value !== null)
    .map(result => result.value);
  
  console.log(`Получено ${validResults.length} успешных ответов из ${countryCodes.length} запросов`);
  
  // Собираем все продукты из валидных результатов
  let allProducts: any[] = [];
  let totalPages = 1;
  
  validResults.forEach(result => {
    if (result && result.data) {
      // Проверяем разные структуры ответа
      if (result.data.products) {
        allProducts = [...allProducts, ...result.data.products];
        totalPages = Math.max(totalPages, result.data.total_pages || 1);
      } else if (result.data.data && result.data.data.products) {
        allProducts = [...allProducts, ...result.data.data.products];
        totalPages = Math.max(totalPages, result.data.data.total_pages || 1);
      }
    }
  });
  
  console.log(`Собрано ${allProducts.length} уникальных продуктов из всех запросов`);
  
  // Если нет результатов, возвращаем null для перехода к запасному варианту
  if (allProducts.length === 0) {
    return null;
  }
  
  // Формируем результат в формате, совместимом с ожиданиями парсера
  return {
    data: {
      data: {
        products: allProducts,
        total_pages: totalPages
      },
      status: "OK"
    },
    totalPages: totalPages,
    isDemo: false
  };
};

/**
 * Выполняет запрос к API Zylalabs для конкретной страны, как в HTML-примере
 * @param query Поисковый запрос
 * @param countryCode Код страны
 * @param page Номер страницы
 * @param language Код языка (добавлен параметр)
 * @returns Результаты поиска или null в случае ошибки
 */
export const makeZylalabsCountryRequest = async (
  query: string, 
  countryCode: string, 
  page: number = 1,
  language: string = 'ru' // По умолчанию используем русский язык
): Promise<any> => {
  const apiKey = getApiKey();
  
  // Проверка наличия ключа API
  if (!apiKey) {
    console.error('Отсутствует API ключ');
    return null;
  }
  
  // Формирование URL запроса точно как в HTML-примере, но с добавлением языка
  const params = new URLSearchParams({
    q: query,
    country: countryCode,
    page: page.toString(),
    language: language // Добавляем параметр языка
  });
  
  const apiBaseUrl = "https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products";
  const url = `${apiBaseUrl}?${params.toString()}`;
  
  // Проверяем кэш для данного URL
  const cachedResponse = getCachedResponse(url);
  if (cachedResponse) {
    console.log(`Используем кэшированные данные для страны ${countryCode}`);
    return cachedResponse;
  }
  
  console.log(`Запрос товаров для страны ${countryCode} на языке ${language}:`, url);
  
  try {
    // Устанавливаем таймаут в 10 секунд для каждого запроса по стране (было 15)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд для запросов по отдельным странам
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    // Очищаем таймаут
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Ошибка API для страны ${countryCode}:`, response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Кэшируем результат
    setCacheResponse(url, data);
    
    return data;
  } catch (error: any) {
    console.warn(`Ошибка при запросе товаров для страны ${countryCode}:`, error.message);
    return null;
  }
};
