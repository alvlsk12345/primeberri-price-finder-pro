
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { checkApiKey, buildMultiCountrySearchUrl } from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { parseApiResponse } from "./responseParserService";
import { withRetry } from "./retryService";
import { fetchFromZylalabs, getZylalabsApiUrl } from "./clients/zylalabsApiClient";
import { isSearchEngineLink } from "../url";

/**
 * Searches for products using Zylalabs API with pagination, retry support,
 * and multiple countries
 */
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  // Validate API key
  if (!checkApiKey()) {
    const mockResults = getMockSearchResults(params.query);
    console.log('API ключ не найден, используем моковые данные');
    return { ...mockResults, fromMock: true };
  }
  
  // Extract search parameters
  const countries = params.countries || ['gb'];
  const language = params.language || 'en';
  const page = params.page || 1;
  
  // Log API key information (partial, for security)
  const keyPreview = ZYLALABS_API_KEY ? `${ZYLALABS_API_KEY.substring(0, 5)}...` : 'отсутствует';
  console.log(`Используем API ключ: ${keyPreview}`);
  console.log(`Поиск товаров с параметрами: страна=${countries[0]}, язык=${language}, страница=${page}`);
  
  try {
    // Execute search with retry capability
    return await withRetry(async (attempt, proxyIndex) => {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      console.log(`Используем прокси ${proxyIndex}`);
      
      // Build the API URL with proper proxy
      const apiUrl = buildMultiCountrySearchUrl(params.query, countries, language, page, proxyIndex);
      console.log('URL запроса:', apiUrl);
      
      // Fetch data from API
      let data;
      try {
        data = await fetchFromZylalabs(apiUrl, proxyIndex);
        console.log("API Response data received successfully");
      } catch (e) {
        console.error('Ошибка при запросе к API:', e);
        throw e;
      }
      
      // Parse and normalize the API response
      try {
        const parsedResult = parseApiResponse(data);
        console.log(`Успешно получено ${parsedResult.products?.length || 0} товаров`);
        
        // Проверяем качество полученных ссылок
        if (parsedResult.products && parsedResult.products.length > 0) {
          let searchLinkCounter = 0;
          let directLinkCounter = 0;
          
          parsedResult.products.forEach((product: any) => {
            if (product.link) {
              if (isSearchEngineLink(product.link)) {
                searchLinkCounter++;
              } else {
                directLinkCounter++;
              }
            }
          });
          
          console.log(`Статистика ссылок: ${directLinkCounter} прямых, ${searchLinkCounter} поисковых`);
          if (searchLinkCounter > directLinkCounter) {
            console.warn('Предупреждение: большинство полученных ссылок ведут на поисковые системы');
          }
        }
        
        return { ...parsedResult, fromMock: false };
      } catch (error) {
        console.error('Ошибка при парсинге ответа:', error);
        toast.warning('Получены некорректные данные от API');
        throw error;
      }
    });
  } catch (error) {
    // If all retries fail, return mock data
    console.error('Не удалось получить данные после всех попыток, используем мок-данные');
    console.log('Используем мок-данные для запроса:', params.query);
    
    // Генерируем расширенные мок-данные с учетом запроса пользователя
    const mockData = getMockSearchResults(params.query);
    
    // Отображаем информативное уведомление
    toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
    
    return { ...mockData, fromMock: true };
  }
};

// Import needed constants for proxy and API key validation
import { ZYLALABS_API_KEY, MAX_RETRY_ATTEMPTS } from "./zylalabsConfig";
