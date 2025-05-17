
import { getApiKey, BASE_URL, REQUEST_TIMEOUT } from "./config";
import { getCachedResponse, setCacheResponse } from "./cacheService";
import { mapProductsFromApi } from "./productMapper";
import { useDemoModeForced } from "../mock/mockServiceConfig";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { Product } from "../../types";

// Страны ЕС для поиска
const EU_COUNTRIES = ['de', 'fr', 'it', 'es', 'nl', 'be', 'ie', 'at', 'pt', 'pl', 'se'];

/**
 * Поиск товаров в странах ЕС
 * @param query Поисковый запрос
 * @param page Номер страницы
 * @param forceNewSearch Принудительно выполнить новый поиск (игнорировать кеш)
 * @returns Результаты поиска товаров
 */
export const searchEuProducts = async (query: string, page: number = 1, forceNewSearch: boolean = false): Promise<{
  products: Product[],
  totalPages: number,
  isDemo: boolean,
  apiInfo: Record<string, string>
}> => {
  try {
    console.log(`Поиск товаров в ЕС: запрос="${query}", страница=${page}, принудительный=${forceNewSearch}`);
    
    // Проверяем режим демо-данных
    if (useDemoModeForced) {
      console.log('Режим демо-данных активирован, возвращаем демо-результаты');
      const demoResults = generateMockSearchResults(query, page);
      return {
        products: demoResults.products,
        totalPages: demoResults.totalPages,
        isDemo: true,
        apiInfo: {
          source: 'Demo Mode (forced)',
          timestamp: new Date().toISOString(),
          query,
          page: String(page),
          forceNewSearch: String(forceNewSearch),
          isDemo: "true"
        }
      };
    }
    
    // Получаем API ключ
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.error('API ключ не найден, возвращаем демо-данные');
      const demoData = generateMockSearchResults(query, page);
      return {
        products: demoData.products,
        totalPages: demoData.totalPages,
        isDemo: true,
        apiInfo: {
          error: 'API ключ не найден',
          source: 'Demo Data',
          isDemo: "true"
        }
      };
    }
    
    // Создаем уникальный ключ кеша с учетом параметра принудительного поиска
    const createCacheKey = (country: string) => 
      `${BASE_URL}?query=${encodeURIComponent(query)}&page=${page}&countries=${country}&language=ru&forceNew=${forceNewSearch}`;
    
    // Собираем все товары из стран ЕС
    let allProducts: Product[] = [];
    let activeCountries: string[] = [];
    let errorCountries: string[] = [];
    let totalResults = 0;
    const apiInfo: Record<string, string> = {};
    
    // Получаем данные из каждой страны параллельно
    const results = await Promise.all(
      EU_COUNTRIES.map(async (country) => {
        try {
          const url = `${BASE_URL}?query=${encodeURIComponent(query)}&page=${page}&countries=${country}&language=ru`;
          const cacheKey = createCacheKey(country);
          
          // Проверяем кеш, если не запрошен принудительный поиск
          const cachedData = getCachedResponse(cacheKey, forceNewSearch);
          if (cachedData && !forceNewSearch) {
            console.log(`Используем кешированные данные для страны: ${country}`);
            return { 
              country, 
              data: cachedData, 
              fromCache: true 
            };
          }
          
          console.log(`Запрос к API для страны: ${country} (URL: ${url})`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Ошибка API для страны ${country} (${response.status}):`, errorText);
            throw new Error(`${response.status}: ${errorText.substring(0, 100)}...`);
          }
          
          const data = await response.json();
          
          // Сохраняем успешный ответ в кеш
          setCacheResponse(cacheKey, data);
          
          return { country, data, fromCache: false };
        } catch (error) {
          console.error(`Ошибка при запросе данных для страны ${country}:`, error);
          errorCountries.push(country);
          return { country, data: null, error: String(error), fromCache: false };
        }
      })
    );
    
    // Обрабатываем результаты и собираем товары
    for (const result of results) {
      if (result.data && Array.isArray(result.data.products)) {
        const countryProducts = mapProductsFromApi(result.data.products, result.country);
        allProducts = [...allProducts, ...countryProducts];
        totalResults += countryProducts.length;
        activeCountries.push(result.country);
        
        // Сохраняем информацию об API
        if (result.data.remainingCalls) {
          apiInfo.remainingCalls = result.data.remainingCalls;
        }
      }
    }
    
    // Проверяем наличие результатов
    if (allProducts.length === 0) {
      console.log('Не найдены товары в странах ЕС, возвращаем демо-данные');
      const demoData = generateMockSearchResults(query, page);
      return {
        products: demoData.products,
        totalPages: demoData.totalPages,
        isDemo: true,
        apiInfo: {
          error: `Не найдены товары в странах: ${EU_COUNTRIES.join(', ')}`,
          errorCountries: errorCountries.join(', '),
          source: 'Demo Data',
          forceNewSearch: String(forceNewSearch),
          isDemo: "true"
        }
      };
    }
    
    console.log(`Найдено ${allProducts.length} товаров в странах: ${activeCountries.join(', ')}`);
    
    // Формируем дополнительную информацию об API
    apiInfo.activeCountries = activeCountries.join(',');
    apiInfo.errorCountries = errorCountries.join(',');
    apiInfo.totalResults = String(totalResults);
    apiInfo.time = new Date().toISOString();
    apiInfo.query = query;
    apiInfo.page = String(page);
    apiInfo.forceNewSearch = String(forceNewSearch);
    apiInfo.isDemo = "false";
    
    return {
      products: allProducts,
      totalPages: Math.max(1, Math.ceil(totalResults / 12)),
      isDemo: false,
      apiInfo
    };
  } catch (error) {
    console.error('Критическая ошибка при поиске товаров в ЕС:', error);
    
    // В случае ошибки возвращаем демо-данные
    const demoData = generateMockSearchResults(query, page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages,
      isDemo: true,
      apiInfo: {
        error: error instanceof Error ? error.message : String(error),
        source: 'Demo Data (Error Fallback)',
        forceNewSearch: String(forceNewSearch),
        isDemo: "true"
      }
    };
  }
};
