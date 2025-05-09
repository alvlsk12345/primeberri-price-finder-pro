
import { toast } from "sonner";
import { SearchParams } from "../types";
import { getMockSearchResults, useDemoModeForced } from "./mockDataService";
import { handleApiError, handleFetchError } from "./errorHandlerService";
import { parseApiResponse } from "./responseParserService";
import { 
  ZYLALABS_API_KEY, 
  buildMultiCountrySearchUrl, 
  checkApiKey, 
  REQUEST_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
  sleep
} from "./zylalabsConfig";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log('searchProductsViaZylalabs вызван с параметрами:', params);
  
  // Когда установлен режим принудительного использования демо-данных
  if (useDemoModeForced) {
    console.log('Принудительное использование демо-данных для запроса:', params.query, 'страница:', params.page);
    // Добавим небольшую задержку для имитации запроса (не более 500мс)
    await new Promise(resolve => setTimeout(resolve, 500));
    const results = await getMockSearchResults(params.query, params.page);
    return {
      ...results,
      totalPages: Math.ceil((results.total || results.products.length) / 9),
      apiInfo: {}
    };
  }

  // Получаем страну для поиска
  const country = params.countries && params.countries.length > 0 ? params.countries[0] : 'de';
  const language = params.language || 'en';
  const page = params.page || 1;
  
  // Проверяем наличие API ключа
  if (!checkApiKey()) {
    console.error('API ключ не настроен, используем демо-данные');
    toast.error('API ключ не настроен. Используются демонстрационные данные.');
    const mockResults = await getMockSearchResults(params.query, params.page);
    return {
      ...mockResults,
      totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
      isDemo: true,
      apiInfo: {}
    };
  }
  
  // Проверка правильного URL API
  console.log('Используется API эндпоинт: https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products');
  
  // Создаем URL для запроса
  const url = buildMultiCountrySearchUrl(params.query, params.countries || [], language, page);
  console.log(`Выполняем запрос к API: ${url}`);

  // Создаем контроллер для возможности отмены запроса по тайм-ауту
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  // Настраиваем заголовки запроса
  const headers = {
    'accept': 'application/json',
    'authorization': `Bearer ${ZYLALABS_API_KEY}`
  };
  
  // Выполняем запрос с повторными попытками при неудаче
  let retryCount = 0;
  
  while (retryCount <= MAX_RETRY_ATTEMPTS) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      
      // Очищаем таймаут после получения ответа
      clearTimeout(timeoutId);
      
      // Сохраняем информацию из заголовков ответа для отображения пользователю
      const apiInfo: Record<string, string> = {};
      const importantHeaders = [
        'X-Zyla-API-Calls-Monthly-Remaining',
        'X-Zyla-RateLimit-Limit',
        'X-Zyla-API-Calls-Daily-Remaining'
      ];
      
      importantHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          apiInfo[header] = value;
        }
      });
      
      // Обрабатываем ошибки API
      if (!response.ok) {
        // Если это ошибка 429 (слишком много запросов) или 503 (сервис недоступен),
        // то пробуем повторить запрос после задержки
        if ((response.status === 429 || response.status === 503) && retryCount < MAX_RETRY_ATTEMPTS) {
          console.warn(`Получена ошибка ${response.status}. Повторная попытка ${retryCount + 1} из ${MAX_RETRY_ATTEMPTS}`);
          retryCount++;
          await sleep(RETRY_DELAY * retryCount); // Прогрессивная задержка
          continue;
        }
        
        // Если превышено число попыток или это другая ошибка - выбрасываем исключение
        await handleApiError(response);
      }
      
      // Парсим JSON-ответ
      const data = await response.json();
      console.log('Получен ответ от API:', data);
      
      // Используем функцию parseApiResponse для корректной обработки структуры ответа
      const { products, total, apiInfo: extractedApiInfo } = parseApiResponse(data, response.headers);
      
      // Объединяем информацию из заголовков с информацией от парсера
      const combinedApiInfo = { ...apiInfo, ...(extractedApiInfo || {}) };
      
      // Проверяем, есть ли результаты
      if (products && products.length > 0) {
        console.log(`Получены результаты от API для запроса "${params.query}", найдено товаров:`, products.length);
        
        // Преобразуем данные в формат Product
        const formattedProducts = products.map(product => {
          // Преобразуем в формат, понятный нашему приложению
          return {
            id: product.product_id || String(Math.random()),
            title: product.product_title || product.title || "",
            subtitle: product.product_description?.substring(0, 100) || "",
            price: product.typical_price_range ? product.typical_price_range[0] : "$0",
            currency: "USD", // По умолчанию USD, если нет данных
            image: product.product_photos?.[0] || product.thumbnail || "",
            link: product.product_page_url || "",
            rating: product.product_rating || 0,
            source: product.source || "google",
            description: product.product_description || "",
            availability: product.availability || "В наличии",
            brand: product.brand || product.product_attributes?.Brand || "Nike",
            _numericPrice: parseFloat((product.typical_price_range?.[0] || "0").replace(/[$€£]/g, '')),
            country: country.toUpperCase(),
            specifications: product.product_attributes || {}
          };
        });
        
        return {
          products: formattedProducts,
          totalPages: Math.ceil(total / 9) || 1,
          isDemo: false,
          apiInfo: combinedApiInfo
        };
      } else {
        // Если нет результатов от API, проверяем нужно ли обеспечить минимальное 
        // количество результатов (указано в параметрах)
        console.warn('API вернул пустой массив продуктов или структура ответа неверная');
        if (params.minResultCount && params.minResultCount > 0) {
          console.warn(`API вернул пустой результат. Дополняем демо-данными для минимального количества ${params.minResultCount}`);
          const mockResults = await getMockSearchResults(params.query, params.page);
          return {
            ...mockResults,
            totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
            isDemo: true,
            apiInfo: combinedApiInfo
          };
        }
        
        // Возвращаем пустой результат, если не нужно минимальных результатов
        return {
          products: [],
          totalPages: 0,
          isDemo: false,
          apiInfo: combinedApiInfo
        };
      }
    } catch (error: any) {
      // Очищаем таймаут в случае ошибки
      clearTimeout(timeoutId);
      
      // Если это не ошибка отмены запроса и есть еще попытки, пробуем повторить
      if (error.name !== 'AbortError' && retryCount < MAX_RETRY_ATTEMPTS) {
        console.warn(`Ошибка при запросе к API: ${error.message}. Повторная попытка ${retryCount + 1} из ${MAX_RETRY_ATTEMPTS}`);
        retryCount++;
        await sleep(RETRY_DELAY * retryCount); // Прогрессивная задержка
        continue;
      }
      
      // Обрабатываем ошибку и выводим сообщение пользователю
      handleFetchError(error);
      console.error('Ошибка при запросе к Zylalabs API. Используем демо-данные:', error);
      
      // В случае ошибки возвращаем демо-данные
      const mockResults = await getMockSearchResults(params.query, params.page);
      return {
        ...mockResults,
        totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
        isDemo: true,
        apiInfo: {}
      };
    }
  }
  
  // Если все попытки исчерпаны, используем демо-данные
  console.warn('Все попытки подключения к API исчерпаны. Используем демо-данные.');
  toast.error('Не удалось подключиться к API после нескольких попыток. Используются демонстрационные данные.');
  const mockResults = await getMockSearchResults(params.query, params.page);
  return {
    ...mockResults,
    totalPages: Math.ceil((mockResults.total || mockResults.products.length) / 9),
    isDemo: true,
    apiInfo: {}
  };
};
