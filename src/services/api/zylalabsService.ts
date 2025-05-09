
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { 
  ZYLALABS_API_KEY, 
  MAX_RETRY_ATTEMPTS, 
  RETRY_DELAY, 
  REQUEST_TIMEOUT, 
  checkApiKey, 
  buildMultiCountrySearchUrl, 
  sleep 
} from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { parseApiResponse } from "./responseParserService";

// Функция для поиска товаров через Zylalabs API с поддержкой пагинацией, повторными попытками и множественными странами
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  // Проверяем наличие API ключа
  if (!checkApiKey()) {
    const mockResults = getMockSearchResults(params.query);
    console.log('API ключ не найден, используем моковые данные');
    return { ...mockResults, fromMock: true };
  }
  
  let attempts = 0;
  let lastError = null;
  let proxyIndex = 0; // Start with direct connection (no proxy)

  // Используем страны из параметров или дефолтную страну
  const countries = params.countries || ['gb'];
  const language = params.language || 'en';
  const page = params.page || 1;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      console.log(`Используем прокси ${proxyIndex}`);
      
      // Формируем URL запроса для множественных стран с учетом текущего индекса прокси
      const apiUrl = buildMultiCountrySearchUrl(params.query, countries, language, page, proxyIndex);
      console.log('URL запроса:', apiUrl);
      
      // Выполняем запрос к API с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // Set up request headers with additional CORS headers
      const headers: HeadersInit = {
        'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin,
        'Referer': window.location.origin
      };

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      // Логируем статус ответа
      console.log(`API response status: ${response.status}, ok: ${response.ok}`);
      
      // Обрабатываем ошибки API
      if (!response.ok) {
        // Сохраняем полный текст ошибки для диагностики
        const responseText = await response.text();
        console.error("API Error Response Text:", responseText, "Status:", response.status);
        
        try {
          // Пытаемся распарсить ответ как JSON для более подробной информации
          const errorData = JSON.parse(responseText);
          console.error("API Error Data:", errorData);
          
          // Проверяем наличие сообщения о превышении лимита
          if (errorData.message && (
              errorData.message.includes('exceeded the allowed limit') || 
              errorData.message.includes('limit exceeded')
            )) {
            console.error('API usage limit exceeded');
            toast.error('Превышен лимит запросов к API. Пожалуйста, обратитесь в поддержку.');
            return { ...getMockSearchResults(params.query), fromMock: true };
          }
        } catch (e) {
          // Если не удалось распарсить как JSON, используем текст как есть
        }
        
        // Для всех ошибок сначала меняем индекс прокси и повторяем
        proxyIndex = (proxyIndex + 1) % 5; // Try all 5 proxies
        console.warn(`Получен статус ${response.status}, пробуем другой прокси`);
        
        // Если перебрали все прокси, увеличиваем счетчик попыток
        if (proxyIndex === 0) {
          attempts++;
        }
        
        await sleep(RETRY_DELAY);
        continue;
      }

      // Парсим JSON ответ
      let data;
      try {
        data = await response.json();
        console.log("API Response data:", data);
      } catch (e) {
        console.error('Ошибка при парсинге ответа API:', e);
        throw new Error('Не удалось обработать ответ API');
      }
      
      // Проверяем структуру данных и нормализуем ответ
      try {
        const parsedResult = parseApiResponse(data);
        return { ...parsedResult, fromMock: false };
      } catch (error) {
        console.error('Ошибка при парсинге ответа:', error);
        toast.warning('Получены некорректные данные от API');
        return { ...getMockSearchResults(params.query), fromMock: true };
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
      console.error("Fetch error:", error);
      
      // Если вероятная проблема с CORS, меняем прокси
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('Произошла ошибка "Failed to fetch", пробуем другой прокси');
        proxyIndex = (proxyIndex + 1) % 5; // Try all 5 proxies
        
        // Если перебрали все прокси, увеличиваем счетчик попыток
        if (proxyIndex === 0) {
          attempts++;
        }
      } else {
        // Другие ошибки - просто увеличиваем счетчик
        attempts++;
      }
      
      lastError = error;
      
      if (attempts < MAX_RETRY_ATTEMPTS) {
        console.log(`Повторная попытка через ${RETRY_DELAY}мс`);
        await sleep(RETRY_DELAY);
        continue; // Переходим к следующей попытке
      }
    }
  }
  
  // Если все попытки исчерпаны, используем мок-данные
  console.error('Все попытки запросов исчерпаны:', lastError);
  toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
  
  // Показываем более подробное сообщение в консоли для отладки
  console.log('Детали последней ошибки:', lastError);
  
  // Возвращаем мок-данные для демонстрации интерфейса с флагом fromMock
  return { ...getMockSearchResults(params.query), fromMock: true };
};
