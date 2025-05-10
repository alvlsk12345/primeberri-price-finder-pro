
import { SearchParams } from "../../types";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { getApiKey, REQUEST_TIMEOUT } from "./config";
import { buildZylalabsUrl } from "./urlBuilder";
import { toast } from "sonner"; 

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
  
  // Формирование URL запроса
  const url = buildZylalabsUrl(params);
  console.log('Запрос к API с URL:', url);
  
  try {
    // Показываем уведомление о запросе
    toast.loading('Выполняется запрос к Zylalabs API...', {
      id: 'api-request',
      duration: REQUEST_TIMEOUT
    });
    
    // Выполняем запрос с чёткими заголовками, как в HTML-примере
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      // Устанавливаем таймаут через AbortController
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    
    // Завершаем уведомление о запросе
    toast.dismiss('api-request');
    
    // Проверка успешности запроса
    if (!response.ok) {
      console.error('Ошибка API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Тело ответа с ошибкой:', errorText);
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
        
        // Возвращаем полный ответ с метаданными
        return {
          data: data,
          totalPages: data.data.total_pages || 1,
          isDemo: false,
          remainingCalls: remainingCalls
        };
      } else {
        console.warn('Нестандартная структура ответа API:', data);
        // Пытаемся вернуть данные в любом случае для дальнейшей обработки
        return {
          data: data,
          totalPages: 1,
          isDemo: false,
          remainingCalls: remainingCalls
        };
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
    if (error.name === 'TimeoutError' || (error.name === 'AbortError')) {
      console.error('Запрос был отменен из-за таймаута');
      toast.error('Превышен таймаут ожидания ответа от Zylalabs API');
    } else {
      console.error('Ошибка при запросе к API:', error);
      toast.error(`Ошибка при запросе к API: ${error.message}`);
    }
    
    // Генерируем демо-данные при ошибке запроса
    const demoData = generateMockSearchResults(params.query, params.page);
    return {
      ...demoData,
      isDemo: true,
      error: error.message
    };
  }
};
