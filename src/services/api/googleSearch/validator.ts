
/**
 * Функции для проверки валидности API и тестирования
 */

import { GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID, API_CONFIG } from './config';

/**
 * Проверяет валидность конфигурации Google API
 * @returns {boolean} Результат проверки конфигурации
 */
export const validateGoogleApiConfig = (): boolean => {
  // Проверяем наличие ключей
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length < 10) {
    console.error('Google API ключ не задан или некорректный');
    return false;
  }
  
  if (!GOOGLE_SEARCH_ENGINE_ID || GOOGLE_SEARCH_ENGINE_ID.length < 5) {
    console.error('Google Search Engine ID не задан или некорректный');
    return false;
  }
  
  return true;
};

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
    const apiUrl = `${API_CONFIG.BASE_URL}?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${testQuery}&searchType=image&num=1`;
    
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
    const minimalUrl = `${API_CONFIG.BASE_URL}?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=test`;
    console.log(`МИНИМАЛЬНЫЙ URL: ${minimalUrl}`);
    
    // Добавляем случайное число для предотвращения кэширования
    const noCacheUrl = `${minimalUrl}&_nocache=${Date.now()}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
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
