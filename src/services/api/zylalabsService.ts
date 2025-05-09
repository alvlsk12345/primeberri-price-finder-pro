
import { toast } from "sonner";
import { SearchParams } from "../types";
import { ZYLALABS_API_KEY, MAX_RETRY_ATTEMPTS, RETRY_DELAY, REQUEST_TIMEOUT, checkApiKey, buildMultiCountrySearchUrl, sleep } from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { handleApiError, handleFetchError } from "./errorHandlerService";
import { parseApiResponse } from "./responseParserService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией, повторными попытками и множественными странами
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<{products: any[], total: number, isDemo?: boolean, apiInfo?: Record<string, string>}> => {
  // Проверяем наличие API ключа
  if (!checkApiKey()) {
    toast.error("API ключ для Zylalabs не настроен");
    return getMockSearchResults(params.query);
  }
  
  let attempts = 0;
  let lastError = null;
  let responseHeaders = null;

  // Используем страны из параметров или дефолтную страну
  const countries = params.countries || ['gb'];
  const language = params.language || 'en';
  const page = params.page || 1;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      
      // Формируем URL запроса для множественных стран
      const apiUrl = buildMultiCountrySearchUrl(params.query, countries, language, page);
      console.log('URL запроса:', apiUrl);
      
      // Выполняем запрос к API с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': window.location.origin,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Сохраняем заголовки ответа для анализа ограничений API
      responseHeaders = {};
      response.headers.forEach((value, name) => {
        if (name.toLowerCase().startsWith('x-zyla')) {
          responseHeaders[name] = value;
          console.log(`${name}: ${value}`);
        }
      });
      
      // Обрабатываем ошибки API
      if (!response.ok) {
        if (response.status === 503) {
          // Получаем дополнительную информацию об ошибке
          let errorBody = null;
          try {
            errorBody = await response.json();
            console.warn('Ошибка 503, детали:', errorBody);
          } catch (e) {
            console.warn('Не удалось получить JSON с деталями ошибки 503');
          }
          
          // Повторяем запрос при временной недоступности сервиса
          console.warn('Сервис временно недоступен, попытка повтора через', RETRY_DELAY);
          lastError = new Error(`Сервис временно недоступен: ${errorBody?.message || ''}`);
          attempts++;
          await sleep(RETRY_DELAY);
          continue;
        } else {
          // Обработка других ошибок
          await handleApiError(response);
        }
      }

      // Парсим JSON ответ
      const data = await response.json();
      
      // Проверяем структуру данных и нормализуем ответ
      try {
        const parsedResult = parseApiResponse(data);
        
        // Если данные получены успешно, но их нет, возвращаем пустой результат
        if (parsedResult.products.length === 0) {
          toast.info("По вашему запросу ничего не найдено в Zylalabs API");
          return { products: [], total: 0 };
        }
        
        // Добавляем информацию о лимитах API из заголовков
        if (responseHeaders) {
          parsedResult.apiInfo = responseHeaders;
        }
        
        return parsedResult;
      } catch (error) {
        console.error('Ошибка при парсинге ответа:', error);
        toast.warning('Получены некорректные данные от API Zylalabs');
        return getMockSearchResults(params.query);
      }
    } catch (error: any) {
      // Обрабатываем ошибку прерывания запроса при истечении таймаута
      if (error.name === 'AbortError') {
        console.warn('Запрос был отменен из-за истечения времени ожидания, попытка повтора');
        lastError = error;
        attempts++;
        await sleep(RETRY_DELAY);
        continue; // Переходим к следующей попытке
      }
      
      // Для других ошибок - логируем и обрабатываем
      handleFetchError(error);
      
      // Увеличиваем счетчик попыток
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRY_ATTEMPTS) {
        console.log(`Повторная попытка ${attempts}/${MAX_RETRY_ATTEMPTS} через ${RETRY_DELAY}мс`);
        await sleep(RETRY_DELAY);
        continue; // Переходим к следующей попытке
      }
    }
  }
  
  // Если все попытки исчерпаны, используем мок-данные
  console.error('Все попытки запросов исчерпаны:', lastError);
  toast.error('Не удалось подключиться к API поиска (исчерпаны все попытки). Используем демонстрационные данные.');
  
  // Возвращаем мок-данные для демонстрации интерфейса
  return getMockSearchResults(params.query);
};
