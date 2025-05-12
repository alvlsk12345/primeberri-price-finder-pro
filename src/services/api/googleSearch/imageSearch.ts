
/**
 * Функции для поиска изображений через Google Custom Search API
 */

import { GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID, imageCache, API_CONFIG } from './config';
import { handleApiError } from "../errorHandlerService";
import { processProductImage } from "../../image";

/**
 * Функция для поиска изображения через Google Custom Search API
 * @param brand Название бренда
 * @param product Название продукта (опционально)
 * @param index Индекс для выбора результата
 * @returns URL изображения или пустую строку в случае ошибки
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
    const apiUrl = `${API_CONFIG.BASE_URL}?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodedQuery}&searchType=image&num=10&safe=active`;
    
    console.log(`ПОЛНЫЙ URL ЗАПРОСА: ${apiUrl}`);
    
    // Выполняем запрос к API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
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
      if (retryCount < API_CONFIG.RETRY_COUNT && (response.status === 429 || response.status === 503)) {
        const retryDelay = API_CONFIG.RETRY_DELAY_BASE * (retryCount + 1);
        console.log(`Повторная попытка запроса через ${retryDelay / 1000} секунды...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
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
      if (retryCount < API_CONFIG.RETRY_COUNT - 1) {
        console.log(`Повторная попытка после таймаута (${retryCount + 1}/${API_CONFIG.RETRY_COUNT})`);
        return searchImageGoogleCSE(query, index, retryCount + 1);
      }
    }
    
    return '';
  }
};
