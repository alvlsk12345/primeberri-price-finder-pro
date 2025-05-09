
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { checkApiKey, buildMultiCountrySearchUrl, MAX_RETRY_ATTEMPTS } from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { parseApiResponse } from "./responseParserService";
import { withRetry } from "./retryService";
import { fetchFromZylalabs } from "./clients/zylalabsApiClient";

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
  const countries = params.countries || ['us']; // Default to 'us' as in Postman
  const language = params.language || 'en';
  const page = params.page || null; // Null для необязательного параметра как в Postman
  
  // Log API key information (partial, for security)
  console.log(`Поиск товаров с параметрами: страна=${countries[0]}, язык=${language}, страница=${page || 'не указана'}`);
  
  try {
    // Execute search with retry capability
    return await withRetry(async (attempt, proxyIndex) => {
      console.log(`Отправляем запрос к Zylalabs API... (попытка ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
      console.log(`Используем прокси ${proxyIndex}`);
      
      // Build the API URL with proper proxy - точное соответствие Postman
      const apiUrl = buildMultiCountrySearchUrl(params.query, countries, language, page, proxyIndex);
      console.log('URL запроса:', apiUrl);
      
      // Fetch data from API
      let data;
      try {
        data = await fetchFromZylalabs(apiUrl, proxyIndex);
        console.log("API Response data received successfully:", 
          data.success ? 'success=true' : 'success=false', 
          data.response ? 'response present' : 'no response');
          
        if (data.success === false && data.message) {
          throw new Error(`API error: ${data.message}`);
        }
      } catch (e) {
        console.error('Ошибка при запросе к API:', e);
        throw e;
      }
      
      // Parse and normalize the API response
      try {
        const parsedResult = parseApiResponse(data);
        console.log(`Успешно получено ${parsedResult.products?.length || 0} товаров`);
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
    toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
    return { ...getMockSearchResults(params.query), fromMock: true };
  }
};

