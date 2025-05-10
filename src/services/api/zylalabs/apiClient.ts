
import { SearchParams } from "../../types";
import { handleApiError, handleFetchError } from "../errorHandlerService";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey, REQUEST_TIMEOUT } from "./config";
import { getCachedResponse, setCacheResponse } from "./cacheService";
import { buildZylalabsUrl } from "./urlBuilder";
import { toast } from "sonner"; 

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
    console.error('Отсутствует API ключ');
    toast.error('Отсутствует API ключ для доступа к Zylalabs. Запрос невозможен.');
    throw new Error('API ключ не задан');
  }
  
  // Формирование URL запроса
  const url = buildZylalabsUrl(params);
  console.log('Запрос к API с URL:', url);
  
  // Создание контроллера для отмены запроса по таймауту
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    // Вывод подробной информации о запросе
    console.log('Отправка запроса к Zylalabs API:');
    console.log('- URL:', url);
    console.log('- Метод:', 'GET');
    console.log('- API ключ:', `Bearer ${apiKey.substring(0, 5)}...`);
    
    toast.loading('Выполняется запрос к Zylalabs API...', {
      id: 'api-request',
      duration: REQUEST_TIMEOUT
    });
    
    // Выполняем запрос с обновленными заголовками
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });
    
    // Очистка таймера
    clearTimeout(timeoutId);
    console.log('Получен ответ от сервера, статус:', response.status);
    
    toast.dismiss('api-request');
    
    // Вывод всех заголовков для отладки
    const headers: Record<string, string> = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    });
    console.log('Заголовки ответа:', headers);
    
    // Проверка успешности запроса
    if (!response.ok) {
      // Обработка ошибки от API
      console.error('Ошибка API:', response.status, response.statusText);
      const errorResponse = await response.text();
      console.error('Тело ответа с ошибкой:', errorResponse);
      throw new Error(`API вернул ошибку ${response.status}: ${response.statusText}`);
    }
    
    // Разбор ответа
    const responseText = await response.text();
    console.log('Получен текст ответа, длина:', responseText.length);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Структура ответа API:', Object.keys(data));
      
      if (data.status === "OK" && data.data) {
        console.log('API вернул корректный ответ с полем data. Количество продуктов:', 
          Array.isArray(data.data) ? data.data.length : 
          Array.isArray(data.data.data) ? data.data.data.length : 
          Array.isArray(data.data.products) ? data.data.products.length : 'неизвестно');
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
        remainingCalls: remainingCalls,
        apiInfo: {
          status: response.status,
          remainingCalls: remainingCalls,
          timestamp: new Date().toISOString()
        }
      };
      
      // Кешируем успешный результат
      setCacheResponse(url, result);
      
      // Показываем уведомление об успешном запросе
      toast.success('Данные успешно загружены из API');
      
      return result;
    } catch (jsonError) {
      console.error('Ошибка при парсинге JSON:', jsonError);
      console.log('Невалидный JSON в ответе:', responseText.substring(0, 200) + '...');
      throw new Error('Неверный формат JSON в ответе API');
    }
  } catch (error: any) {
    // Очистка таймера
    clearTimeout(timeoutId);
    toast.dismiss('api-request');
    
    // Проверяем, был ли запрос отменен по таймауту
    if (error.name === 'AbortError') {
      console.error('Запрос был отменен из-за таймаута');
      toast.error('Превышен таймаут ожидания ответа от Zylalabs API');
      throw new Error('Превышено время ожидания API');
    }
    
    // Проверка на ошибку CORS
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Возникла ошибка CORS при запросе к API');
      toast.error('Ошибка доступа к API (CORS). Попробуйте использовать прокси.');
      throw new Error('Ошибка CORS при запросе к API');
    }
    
    // Обработка других ошибок сети
    console.error('Ошибка при запросе к API:', error);
    toast.error(`Ошибка при запросе к API: ${error.message}`);
    throw error;
  }
};
