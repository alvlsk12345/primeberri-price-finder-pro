
import { getApiKey } from "./config";
import { getPriorityEuCountries } from "../zylalabsService";
import { generateMockSearchResults } from "../mock/mockSearchGenerator";
import { parseApiResponse } from "./responseParser";

/**
 * Выполняет поиск по странам Европейского Союза
 * @param query Строка поискового запроса
 * @param page Номер страницы результатов
 * @param signal Объект AbortSignal для отмены запросов (опционально)
 * @returns Результаты поиска
 */
export const searchEuProducts = async (
  query: string, 
  page: number = 1,
  signal?: AbortSignal
): Promise<{products: any[], totalPages: number, isDemo: boolean, apiInfo: Record<string, string>}> => {
  console.log(`Поиск товаров в ЕС для запроса: "${query}", страница: ${page}`);
  
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Отсутствует API ключ для поиска в ЕС');
    const demoData = generateMockSearchResults(query, page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Отсутствует API ключ',
        source: 'Demo Data'
      }
    };
  }
  
  // Получаем приоритетные страны ЕС
  const euCountries = getPriorityEuCountries();
  console.log('Поиск по странам ЕС:', euCountries);
  
  try {
    // Создаем запросы для каждой страны ЕС
    const requests = euCountries.map(country => {
      const url = buildEuSearchUrl(query, country, page);
      return fetchEuProducts(url, apiKey, signal);
    });
    
    // Выполняем все запросы параллельно
    const results = await Promise.allSettled(requests);
    
    // Собираем успешные результаты
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value && result.value.products)
      .map(result => result.value);
    
    if (successfulResults.length === 0) {
      console.log('Не найдено результатов в странах ЕС');
      return {
        products: [],
        totalPages: 0,
        isDemo: false,
        apiInfo: {
          info: 'Нет результатов в странах ЕС',
          source: 'EU Search'
        }
      };
    }
    
    // Объединяем все продукты из разных стран
    let allProducts: any[] = [];
    let maxTotalPages = 1;
    
    successfulResults.forEach(result => {
      if (result.products && Array.isArray(result.products)) {
        allProducts = [...allProducts, ...result.products];
        if (result.totalPages > maxTotalPages) {
          maxTotalPages = result.totalPages;
        }
      }
    });
    
    // Удаляем дубликаты по ID
    const uniqueProducts = removeDuplicateProducts(allProducts);
    
    console.log(`Найдено ${uniqueProducts.length} уникальных товаров в странах ЕС`);
    
    return {
      products: uniqueProducts,
      totalPages: maxTotalPages,
      isDemo: false,
      apiInfo: {
        source: 'EU Search',
        countries: euCountries.join(',')
      }
    };
  } catch (error) {
    console.error('Ошибка при поиске в странах ЕС:', error);
    const demoData = generateMockSearchResults(query, page);
    return {
      products: demoData.products,
      totalPages: demoData.totalPages || 1,
      isDemo: true,
      apiInfo: {
        error: 'Ошибка при поиске в ЕС',
        source: 'Demo Data'
      }
    };
  }
};

/**
 * Формирует URL для поиска товаров в конкретной стране ЕС
 */
const buildEuSearchUrl = (query: string, country: string, page: number): string => {
  const params = new URLSearchParams({
    q: query,
    country: country,
    page: page.toString(),
    language: 'ru' // По умолчанию используем русский язык
  });
  
  return `https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?${params.toString()}`;
};

/**
 * Выполняет запрос к API для получения товаров из конкретной страны ЕС
 */
const fetchEuProducts = async (url: string, apiKey: string, signal?: AbortSignal): Promise<any> => {
  try {
    // Устанавливаем таймаут в 8 секунд для запросов по странам ЕС
    const controller = new AbortController();
    
    // Объединяем внешний signal с нашим локальным, если внешний передан
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }
    
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    // Исправленный вызов parseApiResponse с корректными параметрами
    const parsedData = parseApiResponse(data);
    return parsedData;
  } catch (error) {
    console.warn(`Ошибка при запросе к ${url}:`, error);
    return null;
  }
};

/**
 * Удаляет дубликаты товаров из массива по ID
 */
const removeDuplicateProducts = (products: any[]): any[] => {
  const uniqueIds = new Set();
  return products.filter(product => {
    if (!product.id) return true; // Если у товара нет ID, оставляем его
    
    if (uniqueIds.has(product.id)) {
      return false; // Это дубликат, удаляем
    } else {
      uniqueIds.add(product.id);
      return true; // Это уникальный товар, оставляем
    }
  });
};
