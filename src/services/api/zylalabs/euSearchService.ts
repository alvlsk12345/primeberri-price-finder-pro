
import { makeZylalabsApiRequest } from './apiClient';
import { parseResponse } from './responseParser';
import { clearApiCache } from './cacheService';
import { getApiKey } from './config';
import { generateMockEuProducts } from '../mock/mockProductsData';

/**
 * Поиск товаров в Европе через API Zylalabs
 * @param query Строка запроса
 * @param page Номер страницы
 * @param forceNewSearch Принудительно выполнить новый запрос
 * @param language Язык результатов
 * @param country Страна для поиска
 */
export const searchEuProducts = async (
  query: string,
  page: number = 1,
  forceNewSearch: boolean = false,
  language: string = 'ru',
  country: string = 'de'
) => {
  try {
    console.log(`Поиск товаров в Европе: "${query}", страница ${page}, язык ${language}, страна ${country}`);
    
    // Проверяем наличие API ключа
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.log('API ключ отсутствует, используем демо-данные');
      return {
        products: await generateMockEuProducts(query, 36),
        totalPages: 5,
        isDemo: true,
        apiInfo: {
          source: 'demo',
          reason: 'API ключ отсутствует'
        }
      };
    }
    
    // Очищаем кеш, если запрошен принудительный поиск
    if (forceNewSearch) {
      clearApiCache();
    }
    
    // Подготавливаем параметры запроса к API с добавлением direct_shop_results
    const params = {
      query,
      page,
      countries: [country],
      language,
      direct_shop_results: true,
      shops_selection: 'amazon.de,otto.de,mediamarkt.de,zalando.de,saturn.de'
    };
    
    // Запрашиваем данные с API
    const response = await makeZylalabsApiRequest(params, forceNewSearch);
    
    if (!response) {
      console.log('API вернул пустой ответ, используем демо-данные');
      return {
        products: await generateMockEuProducts(query, 36),
        totalPages: 5,
        isDemo: true,
        apiInfo: {
          source: 'demo',
          reason: 'API вернул пустой ответ'
        }
      };
    }
    
    // Парсим ответ и преобразуем товары в нужный формат
    const result = await parseResponse(response, query);
    
    // Если API не вернул товары, используем демо-данные
    if (!result.products || result.products.length === 0) {
      console.log('API вернул 0 товаров, используем демо-данные');
      return {
        products: await generateMockEuProducts(query, 36),
        totalPages: 5,
        isDemo: true,
        apiInfo: {
          source: 'demo',
          reason: 'API вернул 0 товаров',
          apiResponse: typeof response === 'object' ? JSON.stringify(response).substring(0, 200) + '...' : String(response)
        }
      };
    }
    
    console.log(`API вернул ${result.products.length} товаров`);
    return result;
  } catch (error) {
    console.error('Ошибка при поиске товаров через API Zylalabs:', error);
    
    // В случае ошибки возвращаем демо-данные
    return {
      products: await generateMockEuProducts(query, 36),
      totalPages: 5,
      isDemo: true,
      apiInfo: {
        source: 'demo',
        reason: 'Ошибка API',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

/**
 * Экспортируем функции для использования в других модулях
 */
export default {
  searchEuProducts
};
