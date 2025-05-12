
/**
 * Поиск изображений через Google Custom Search API
 */

import { API_CONFIG, GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID, imageCache } from './config';
import { validateGoogleApiConfig } from './validator';

/**
 * Поиск изображения продукта в Google
 * @param brand Название бренда
 * @param product Название продукта
 * @param index Индекс изображения (если нужно получить альтернативное)
 * @returns URL изображения или пустая строка в случае ошибки
 */
export const searchProductImageGoogle = async (
  brand: string, 
  product: string, 
  index: number = 0
): Promise<string> => {
  if (!brand && !product) {
    console.warn('Не указан ни бренд, ни продукт для поиска изображения');
    return '';
  }

  try {
    // Проверяем валидность конфигурации API
    const isApiConfigValid = validateGoogleApiConfig();
    if (!isApiConfigValid) {
      console.error('Невалидная конфигурация Google API');
      return '';
    }

    // Создаем поисковый запрос, объединяя бренд и продукт
    const searchQuery = product 
      ? `${brand} ${product}` 
      : brand;

    // Используем кэш для ускорения повторных запросов
    const cacheKey = `img_${searchQuery.toLowerCase().replace(/\s+/g, '_')}_${index}`;
    if (imageCache[cacheKey]) {
      console.log(`Использование кэшированного изображения для: ${searchQuery} (индекс ${index})`);
      return imageCache[cacheKey];
    }
    
    console.log(`Выполняется поиск изображения для: "${searchQuery}", индекс: ${index}`);

    // Создаем URL для запроса
    const apiUrl = new URL(API_CONFIG.BASE_URL);
    apiUrl.searchParams.append('key', GOOGLE_API_KEY);
    apiUrl.searchParams.append('cx', GOOGLE_SEARCH_ENGINE_ID);
    apiUrl.searchParams.append('q', searchQuery);
    apiUrl.searchParams.append('searchType', 'image');
    apiUrl.searchParams.append('num', '10'); // Запрашиваем 10 изображений
    apiUrl.searchParams.append('imgSize', 'large'); // Предпочитаем большие изображения
    apiUrl.searchParams.append('safe', 'active'); // Безопасный поиск

    // Добавляем поддержку повторных попыток при ошибках
    let attempts = 0;
    const maxAttempts = API_CONFIG.RETRY_COUNT;
    let delayMs = API_CONFIG.RETRY_DELAY_BASE;

    while (attempts < maxAttempts) {
      try {
        // Выполняем запрос к API
        const response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        // Проверяем успешность запроса
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Ошибка API (${response.status}):`, errorData);
          throw new Error(`API ошибка: ${response.status} ${response.statusText}`);
        }

        // Парсим ответ
        const data = await response.json();
        
        // Проверяем наличие результатов
        if (!data.items || data.items.length === 0) {
          console.log(`Изображения не найдены для: "${searchQuery}"`);
          return '';
        }

        // Получаем нужное изображение по индексу
        const targetIndex = index < data.items.length ? index : 0;
        const imageItem = data.items[targetIndex];
        
        if (imageItem && imageItem.link) {
          // Кэшируем результат
          imageCache[cacheKey] = imageItem.link;
          console.log(`Изображение найдено и кэшировано: ${imageItem.link}`);
          return imageItem.link;
        }
        
        return '';
      } catch (error) {
        attempts++;
        console.warn(`Попытка ${attempts}/${maxAttempts} поиска изображения не удалась: ${error}`);
        
        // Если достигнут лимит попыток, прекращаем попытки
        if (attempts >= maxAttempts) {
          console.error(`Исчерпаны все попытки поиска изображения для: "${searchQuery}"`);
          return '';
        }
        
        // Экспоненциальная задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Увеличиваем задержку для следующей попытки
      }
    }
    
    return '';
  } catch (error) {
    console.error('Ошибка при поиске изображения:', error);
    return '';
  }
};

/**
 * Тестирование минимального запроса к Google API
 * @returns Результат тестирования
 */
export const testGoogleImageSearch = async (): Promise<string> => {
  try {
    console.log('----- ТЕСТОВЫЙ ЗАПРОС ПОИСКА ИЗОБРАЖЕНИЙ GOOGLE API -----');
    console.log(`API КЛЮЧ: "${GOOGLE_API_KEY}"`);
    console.log(`CX ID: "${GOOGLE_SEARCH_ENGINE_ID}"`);
    
    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      return 'Ошибка: Отсутствуют API ключ или ID поисковой системы';
    }
    
    // Тестовый запрос для поиска изображения
    const result = await searchProductImageGoogle('Apple', 'iPhone', 0);
    
    if (result) {
      console.log(`ТЕСТОВЫЙ ПОИСК ИЗОБРАЖЕНИЯ УСПЕШЕН! Получен URL: ${result}`);
      return 'Тестовый поиск изображения успешен! API работает корректно.';
    } else {
      console.log('ТЕСТОВЫЙ ПОИСК ИЗОБРАЖЕНИЯ НЕ ВЕРНУЛ РЕЗУЛЬТАТОВ');
      return 'Запрос выполнен, но результаты не найдены. Проверьте настройки API.';
    }
  } catch (error) {
    console.error('ОШИБКА ПРИ ТЕСТОВОМ ЗАПРОСЕ ПОИСКА ИЗОБРАЖЕНИЙ:', error);
    return `Ошибка при выполнении тестового запроса: ${error.message}`;
  }
};
