
import { SearchParams } from "../../types";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey } from "./config";
import { buildZylalabsUrl } from "./urlBuilder";
import { toast } from "sonner"; 
import { getCachedResponse, setCacheResponse } from "./cacheService";
import { makeZylalabsCountryRequest } from "./countryRequestService";

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

// Реэкспортируем функциональность из отдельных модулей
export { makeParallelZylalabsRequests } from './parallelRequestService';
