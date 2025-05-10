
import { SearchParams } from "../../types";
import { handleApiError, handleFetchError } from "../errorHandlerService";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey, REQUEST_TIMEOUT } from "./config";
import { getCachedResponse, setCacheResponse } from "./cacheService";
import { buildZylalabsUrl } from "./urlBuilder";
import { toast } from "sonner"; // Добавляем импорт toast из sonner

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
    console.log('Использован кешированный ответ для URL:', url);
    return {
      ...cachedResponse,
      fromCache: true
    };
  }
  
  // Создание контроллера для отмены запроса по таймауту
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    // Вывод подробной информации о запросе
    console.log('Отправка запроса к Zylalabs API:');
    console.log('- URL:', url);
    console.log('- Метод:', 'GET');
    console.log('- API ключ:', `Bearer ${apiKey.substring(0, 5)}...`);
    
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
      mode: 'cors', // Явно указываем режим CORS
      credentials: 'omit', // Не отправляем куки
    });
    
    // Очистка таймера
    clearTimeout(timeoutId);
    console.log('Получен ответ от сервера, статус:', response.status);
    
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
      return handleApiError(response);
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
      toast.error('Ошибка в формате данных от API. Используем демо-данные.');
      throw new Error('Неверный формат JSON в ответе API');
    }
  } catch (error) {
    // Очистка таймера
    clearTimeout(timeoutId);
    
    // Обработка ошибок сети и таймаутов
    console.error('Ошибка при запросе к API:', error);
    handleFetchError(error);
    
    // Проверка на ошибку CORS
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Возможно, это ошибка CORS или сетевая проблема');
      toast.error('Ошибка сетевого соединения. Возможно, проблема с CORS или блокировкой запросов.', { duration: 5000 });
    }
    
    // Возврат демо-данных в случае ошибки
    console.log('Ошибка при запросе к API, используем демо-данные');
    return generateMockSearchResults(params.query, params.page);
  }
};

