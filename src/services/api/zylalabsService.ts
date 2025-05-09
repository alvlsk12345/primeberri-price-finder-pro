
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { ZYLALABS_API_KEY, MAX_RETRY_ATTEMPTS, RETRY_DELAY, REQUEST_TIMEOUT, checkApiKey, buildMultiCountrySearchUrl, sleep } from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { handleApiError, handleFetchError } from "./errorHandlerService";
import { parseApiResponse } from "./responseParserService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией, повторными попытками и множественными странами
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  // Проверяем наличие API ключа
  if (!checkApiKey()) {
    return getMockSearchResults(params.query);
  }
  
  let attempts = 0;
  let lastError = null;

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
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Обрабатываем ошибки API
      if (!response.ok) {
        if (response.status === 503) {
          // Повторяем запрос при временной недоступности сервиса
          console.warn('Сервис временно недоступен, попытка повтора через', RETRY_DELAY);
          lastError = new Error(`Сервис временно недоступен`);
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
        return parsedResult;
      } catch (error) {
        console.error('Ошибка при парсинге ответа:', error);
        toast.warning('Получены некорректные данные от API');
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
  toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
  
  // Возвращаем мок-данные для демонстрации интерфейса
  return getMockSearchResults(params.query);
};
