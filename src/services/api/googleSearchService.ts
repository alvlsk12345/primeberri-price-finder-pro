
import { processProductImage } from "../image";
import { applyCorsProxy } from "../image/corsProxyService";
import { handleApiError } from "./errorHandlerService";

// API ключ для Google Custom Search API
const GOOGLE_API_KEY = 'AIzaSyAZxgGY2FDeok5lNlCIIulQda0BBKEK2ZU';
// ID поисковой системы
const GOOGLE_SEARCH_ENGINE_ID = 'e52af8ec5dbe646c8';

// Кэш для хранения результатов поиска изображений
const imageCache: Record<string, string> = {};

/**
 * Проверяет валидность API ключа Google через тестовый запрос
 * @returns {Promise<boolean>} Результат проверки ключа
 */
export const validateGoogleApiKey = async (): Promise<boolean> => {
  try {
    console.log('Проверка валидности Google API ключа...');
    console.log(`ИСПОЛЬЗУЕМЫЙ API КЛЮЧ: "${GOOGLE_API_KEY}"`);
    console.log(`ИСПОЛЬЗУЕМЫЙ CX ID: "${GOOGLE_SEARCH_ENGINE_ID}"`);
    
    // Выполняем простой тестовый запрос
    const testQuery = 'test';
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${testQuery}&searchType=image&num=1`;
    
    console.log(`ТЕСТОВЫЙ ЗАПРОС К GOOGLE API (полный URL): ${apiUrl}`);
    console.log(`Длина API ключа: ${GOOGLE_API_KEY.length}, длина CX ID: ${GOOGLE_SEARCH_ENGINE_ID.length}`);
    
    const response = await fetch(apiUrl);
    console.log(`ОТВЕТ ОТ GOOGLE API - Статус: ${response.status} ${response.statusText}`);
    
    // Выводим все заголовки ответа для анализа
    console.log('ЗАГОЛОВКИ ОТВЕТА:', Object.fromEntries([...response.headers.entries()]));
    
    const responseData = await response.json();
    
    // Выводим часть ответа для диагностики
    console.log('КРАТКИЙ ОТВЕТ API:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    if (response.ok && responseData && responseData.items && responseData.items.length > 0) {
      console.log('Google API ключ валиден. Получены результаты поиска.');
      return true;
    } else {
      console.error('Google API ключ не валиден или есть проблемы с сервисом:', response.status);
      // Логируем детали ошибки
      if (responseData.error) {
        console.error('ДЕТАЛИ ОШИБКИ API:', {
          code: responseData.error.code,
          message: responseData.error.message,
          errors: responseData.error.errors
        });
      }
      return false;
    }
  } catch (error) {
    console.error('ОШИБКА ПРИ ПРОВЕРКЕ Google API ключа:', error);
    // Более подробное логирование для сетевых ошибок
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('СЕТЕВАЯ ОШИБКА: Не удалось выполнить запрос. Возможно, проблемы с подключением к Интернету или CORS.');
    }
    return false;
  }
};

/**
 * Создает минимальный тестовый запрос к Google API для диагностики
 * @returns {Promise<string>} Результат тестового запроса
 */
export const testMinimalGoogleApiRequest = async (): Promise<string> => {
  try {
    console.log('----- ТЕСТОВЫЙ МИНИМАЛЬНЫЙ ЗАПРОС К GOOGLE API -----');
    console.log(`API КЛЮЧ: "${GOOGLE_API_KEY}"`);
    console.log(`CX ID: "${GOOGLE_SEARCH_ENGINE_ID}"`);
    
    // Минимальный набор параметров
    const minimalUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=test`;
    console.log(`МИНИМАЛЬНЫЙ URL: ${minimalUrl}`);
    
    // Добавляем случайное число для предотвращения кэширования
    const noCacheUrl = `${minimalUrl}&_nocache=${Date.now()}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(noCacheUrl, { 
        signal: controller.signal,
        // Добавляем заголовки для диагностики
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`СТАТУС ОТВЕТА: ${response.status} ${response.statusText}`);
      console.log('ЗАГОЛОВКИ ОТВЕТА:', Object.fromEntries([...response.headers.entries()]));
      
      // Получаем текст ответа для анализа, даже если это не JSON
      const responseText = await response.text();
      console.log('ТЕЛО ОТВЕТА:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
      try {
        // Пробуем распарсить как JSON
        const jsonData = JSON.parse(responseText);
        if (jsonData.items && jsonData.items.length > 0) {
          console.log('ТЕСТОВЫЙ ЗАПРОС УСПЕШЕН! Количество результатов:', jsonData.items.length);
          return 'Тестовый запрос успешен! API работает корректно.';
        } else if (jsonData.error) {
          console.error('ОШИБКА API В ТЕСТОВОМ ЗАПРОСЕ:', jsonData.error);
          return `Ошибка API: ${jsonData.error.code} - ${jsonData.error.message}`;
        } else {
          console.log('ОТВЕТ БЕЗ ОШИБОК, НО БЕЗ РЕЗУЛЬТАТОВ:', jsonData);
          return 'API вернул ответ без ошибок, но без результатов поиска.';
        }
      } catch (jsonError) {
        console.error('НЕ УДАЛОСЬ РАСПАРСИТЬ ОТВЕТ КАК JSON:', jsonError);
        return `Некорректный формат ответа: ${responseText.substring(0, 100)}...`;
      }
    } catch (fetchError) {
      console.error('ОШИБКА FETCH ПРИ ТЕСТОВОМ ЗАПРОСЕ:', fetchError);
      if (fetchError.name === 'AbortError') {
        return 'Тестовый запрос был прерван по таймауту (10 секунд).';
      }
      return `Ошибка при выполнении запроса: ${fetchError.message}`;
    }
  } catch (error) {
    console.error('ОБЩАЯ ОШИБКА В ТЕСТОВОМ ЗАПРОСЕ:', error);
    return `Непредвиденная ошибка: ${error.message}`;
  }
};

/**
 * Функция для поиска изображения через Google Custom Search API
 * Добавлена в экспорт для использования другими компонентами
 */
export const searchProductImageGoogle = async (
  brand: string, 
  product?: string, 
  index: number = 0
): Promise<string> => {
  try {
    // Создаем поисковый запрос на основе бренда и продукта
    const query = product ? `${brand} ${product}` : brand;
    return await searchImageGoogleCSE(query, index);
  } catch (error) {
    console.error(`Ошибка при поиске изображения для ${brand} ${product}:`, error);
    return '';
  }
};

/**
 * Функция для поиска изображения через Google Custom Search API
 * @param query Запрос для поиска изображения (например, "бренд продукт")
 * @param index Индекс для генерации уникального изображения
 * @param retryCount Счетчик повторных попыток
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchImageGoogleCSE = async (query: string, index: number = 0, retryCount: number = 0): Promise<string> => {
  try {
    // Подробное логирование параметров запроса
    console.log(`----- ВЫПОЛНЕНИЕ ЗАПРОСА К GOOGLE CSE -----`);
    console.log(`Запрос: "${query}", Индекс: ${index}, Попытка: ${retryCount + 1}`);
    console.log(`API ключ: "${GOOGLE_API_KEY}" (длина: ${GOOGLE_API_KEY.length})`);
    console.log(`CX ID: "${GOOGLE_SEARCH_ENGINE_ID}" (длина: ${GOOGLE_SEARCH_ENGINE_ID.length})`);
    
    // Проверяем кэш перед выполнением запроса
    const cacheKey = `${query.toLowerCase()}_${index}`;
    if (imageCache[cacheKey]) {
      console.log(`Изображение найдено в кэше для запроса: ${query}`);
      return imageCache[cacheKey];
    }

    // Формируем URL для запроса к Google Custom Search API
    const encodedQuery = encodeURIComponent(query);
    console.log(`Запрос после кодирования: "${encodedQuery}"`);
    
    // Увеличиваем количество результатов и добавляем параметр безопасного поиска
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodedQuery}&searchType=image&num=10&safe=active`;
    
    console.log(`ПОЛНЫЙ URL ЗАПРОСА: ${apiUrl}`);
    
    // Выполняем запрос к API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Подробно логируем информацию об ответе
    console.log(`ОТВЕТ ОТ GOOGLE CSE API - Статус: ${response.status} ${response.statusText}`);
    console.log('ЗАГОЛОВКИ ОТВЕТА:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      // Детально анализируем ошибку
      console.error(`ОШИБКА API - Статус: ${response.status} ${response.statusText}`);
      
      // Получаем текст ошибки, даже если это не JSON
      const errorText = await response.text();
      console.error(`ТЕЛО ОТВЕТА С ОШИБКОЙ: ${errorText.substring(0, 500)}`);
      
      try {
        // Пробуем распарсить как JSON для более подробного анализа
        const errorJson = JSON.parse(errorText);
        console.error('ДЕТАЛИ ОШИБКИ JSON:', errorJson);
      } catch (e) {
        console.error('Не удалось распарсить ответ ошибки как JSON');
      }
      
      // Используем специальный обработчик ошибок API
      const errorDetails = await handleApiError(response);
      
      // Если нужно повторить запрос с другими параметрами
      if (retryCount < 3 && (response.status === 429 || response.status === 503)) {
        console.log(`Повторная попытка запроса через ${(retryCount + 1) * 2} секунды...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return searchImageGoogleCSE(query, index, retryCount + 1);
      }
      
      return '';
    }
    
    // Получаем JSON-данные
    const responseText = await response.text();
    console.log(`НАЧАЛО ОТВЕТА API: ${responseText.substring(0, 200)}...`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('ОШИБКА ПАРСИНГА JSON ОТВЕТА:', jsonError);
      console.error('ТЕКСТ ОТВЕТА:', responseText.substring(0, 500));
      return '';
    }
    
    // Подробно логируем информацию о запросе из ответа
    if (data.queries && data.queries.request && data.queries.request[0]) {
      console.log('ИНФОРМАЦИЯ О ЗАПРОСЕ:', {
        totalResults: data.queries.request[0].totalResults,
        count: data.queries.request[0].count,
        startIndex: data.queries.request[0].startIndex,
        searchTerms: data.queries.request[0].searchTerms
      });
    }
    
    // Проверяем, есть ли результаты в ответе
    if (data && data.items && data.items.length > 0) {
      // Выбираем изображение на основе индекса (если доступно) или берём первое
      const safeIndex = Math.min(index, data.items.length - 1);
      const imageItem = data.items[safeIndex] || data.items[0];
      const imageUrl = imageItem.link;
      
      console.log(`Найдено изображение в позиции ${safeIndex}:`, {
        url: imageUrl,
        title: imageItem.title,
        displayLink: imageItem.displayLink,
        mime: imageItem.mime
      });
      
      if (imageUrl) {
        // Применяем нашу функцию обработки изображения к URL от Google CSE
        const processedUrl = processProductImage(imageUrl, index);
        console.log('ОБРАБОТАННЫЙ URL ИЗОБРАЖЕНИЯ ОТ GOOGLE CSE:', processedUrl);
        
        // Кэшируем результат для повторного использования
        if (processedUrl) {
          imageCache[cacheKey] = processedUrl;
        }
        
        return processedUrl;
      }
    } else {
      console.log('API вернул успешный ответ, но не найдено подходящих изображений');
    }
    
    return '';
  } catch (error) {
    console.error('ОШИБКА ПРИ ПОИСКЕ ИЗОБРАЖЕНИЯ:', error);
    
    // Проверяем, является ли ошибка связанной с таймаутом
    if (error.name === 'AbortError') {
      console.log('Запрос был прерван по таймауту');
      
      // Если не первая попытка, пробуем еще раз
      if (retryCount < 2) {
        console.log(`Повторная попытка после таймаута (${retryCount + 1}/2)`);
        return searchImageGoogleCSE(query, index, retryCount + 1);
      }
    }
    
    return '';
  }
};
