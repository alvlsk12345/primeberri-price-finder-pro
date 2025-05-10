
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
    // Выполняем простой тестовый запрос
    const testQuery = 'test';
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${testQuery}&searchType=image&num=1`;
    
    console.log(`Тестовый запрос к Google API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const responseData = await response.json();
    
    if (response.ok && responseData && responseData.items && responseData.items.length > 0) {
      console.log('Google API ключ валиден:', responseData.items.length > 0 ? 'Получены результаты' : 'Нет результатов');
      return true;
    } else {
      console.error('Google API ключ не валиден или есть проблемы с сервисом:', response.status, responseData);
      // Логируем детали ошибки
      if (responseData.error) {
        console.error('Детали ошибки API:', {
          code: responseData.error.code,
          message: responseData.error.message,
          errors: responseData.error.errors
        });
      }
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке Google API ключа:', error);
    return false;
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
    // Проверяем кэш перед выполнением запроса
    const cacheKey = `${query.toLowerCase()}_${index}`;
    if (imageCache[cacheKey]) {
      console.log(`Изображение найдено в кэше для запроса: ${query}`);
      return imageCache[cacheKey];
    }

    console.log(`Поиск изображения через Google CSE для: ${query} (попытка: ${retryCount + 1})`);
    
    // Формируем URL для запроса к Google Custom Search API
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodedQuery}&searchType=image&num=5`;
    
    console.log(`Запрос к API: ${apiUrl}`);
    
    // Выполняем запрос к API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
    
    const response = await fetch(apiUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Подробно логируем заголовки ответа
    console.log(`Получен ответ от Google CSE API: статус ${response.status}`);
    console.log('Заголовки ответа:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
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
    
    const data = await response.json();
    console.log(`Получены данные от Google CSE API: ${JSON.stringify(data).substring(0, 200)}...`);
    
    // Подробно логируем информацию о запросе из ответа
    if (data.queries && data.queries.request && data.queries.request[0]) {
      console.log('Информация о запросе:', {
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
        // Обрабатываем URL изображения и применяем CORS прокси
        const processedUrl = processProductImage(imageUrl, index);
        
        // Проверяем, правильно ли применился CORS прокси
        const isCorsApplied = processedUrl.includes('corsproxy.io') || 
                              processedUrl.includes('allorigins.win') || 
                              processedUrl.includes('cors-anywhere');
        
        console.log(`Обработанный URL изображения: ${processedUrl} (CORS прокси ${isCorsApplied ? 'применен' : 'не применен'})`);
        
        // Сохраняем результат в кэше
        imageCache[cacheKey] = processedUrl;
        
        return processedUrl;
      }
    } else {
      console.log(`Google CSE API вернул данные без изображений: ${JSON.stringify(data).substring(0, 200)}...`);
    }
    
    console.log(`Google CSE не вернул изображений для запроса: ${query}`);
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения через Google CSE:', error);
    
    // Повторная попытка при временной ошибке
    if (error instanceof TypeError && error.message.includes('Failed to fetch') && retryCount < 3) {
      console.log(`Сетевая ошибка, повторная попытка запроса через ${(retryCount + 1) * 2} секунды...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return searchImageGoogleCSE(query, index, retryCount + 1);
    }
    
    return '';
  }
};

/**
 * Функция для поиска изображения по бренду и продукту
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс для уникальности изображения
 * @returns URL изображения или пустую строку в случае ошибки
 */
export const searchProductImageGoogle = async (brand: string, product: string, index: number = 0): Promise<string> => {
  // Формируем запрос из бренда и продукта
  const query = `${brand} ${product}`;
  
  // Проверяем API ключ при первом запросе
  if (index === 0) {
    const isValid = await validateGoogleApiKey();
    if (!isValid) {
      console.warn('Google API ключ неверен или превышен лимит запросов');
    }
  }
  
  // Ищем изображение по запросу
  return await searchImageGoogleCSE(query, index);
};
