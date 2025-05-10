
import { SearchParams } from "../../types";
import { handleApiError, handleFetchError } from "../errorHandlerService";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey, REQUEST_TIMEOUT } from "./config";
import { getCachedResponse, setCacheResponse } from "./cacheService";
import { buildZylalabsUrl } from "./urlBuilder";

/**
 * Выполняет запрос к API Zylalabs
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
    console.log('Отправка запроса с API ключом:', `Bearer ${apiKey.substring(0, 5)}...`);
    
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
    console.log('Структура ответа API:', Object.keys(data));
    
    if (data.status === "OK" && data.data) {
      console.log('API вернул корректный ответ с полем data. Количество продуктов:', 
        Array.isArray(data.data) ? data.data.length : 'неизвестно');
    } else {
      console.log('Нестандартная структура ответа API:', data);
    }
    
    // Обработка заголовков ответа для получения лимитов API
    const remainingCalls = response.headers.get('X-Zyla-API-Calls-Monthly-Remaining') || 'н/д';
    console.log('Оставшиеся вызовы API:', remainingCalls);
    
    // Сохраняем всю структуру ответа
    const result = {
      data: data,
      totalPages: data.total_pages || 1,
      isDemo: false,
      remainingCalls: remainingCalls
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
