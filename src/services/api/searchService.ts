
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { checkApiKey, buildMultiCountrySearchUrl, MAX_RETRY_ATTEMPTS } from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { parseApiResponse } from "./responseParserService";
import { fetchFromZylalabs, getApiUsageStats } from "./clients/zylalabsApiClient";

/**
 * Searches for products using Zylalabs API with pagination and proper error handling
 * Modified to only make a single API request per search operation
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
  const page = params.page && params.page > 1 ? params.page : null; // Null для страницы 1 по Postman
  
  console.log(`Поиск товаров с параметрами: запрос="${params.query}", страна=${countries[0]}, язык=${language}, страница=${page || '1 (не указана)'}`);
  
  try {
    // Get current API usage before making the request
    const usageStats = getApiUsageStats();
    console.log('Current API usage:', usageStats);
    
    // Show warning if nearing monthly limit
    if (usageStats.monthlyUsage > usageStats.monthlyLimit * 0.9) {
      toast.warning(`Внимание: использовано ${usageStats.monthlyUsage} из ${usageStats.monthlyLimit} запросов за месяц.`);
    }
    
    // Execute search with only a single request - no more retry logic here
    console.log(`Отправляем запрос к Zylalabs API...`);
    
    // Build the API URL - точное соответствие Postman
    // Using the first country only to avoid multiple requests
    const apiUrl = buildMultiCountrySearchUrl(params.query, [countries[0]], language, page);
    console.log('Сформированный URL запроса:', apiUrl);
    
    // Fetch data from API - only passing the apiUrl parameter
    let data;
    try {
      data = await fetchFromZylalabs(apiUrl);
      console.log("API Response data received successfully");
        
      if (data && data.success === false && data.message) {
        console.error('API вернул ошибку с сообщением:', data.message);
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
  } catch (error) {
    // If the error is specifically about rate limiting, show a different message
    if (error.message && error.message.includes('rate limit exceeded')) {
      console.error('Превышен лимит запросов к API:', error);
      toast.error('Превышен лимит запросов к API. Пожалуйста, попробуйте позже.');
      
      // Return minimal mock data to avoid complete failure
      return { ...getMockSearchResults(params.query, 5), fromMock: true, rateLimited: true };
    }
    
    // If request fails, use mock data
    console.error('Не удалось получить данные, используем мок-данные');
    console.log('Используем мок-данные для запроса:', params.query);
    toast.error('Не удалось подключиться к API поиска. Используем демонстрационные данные.');
    
    // Добавляем больше диагностики
    console.error('Финальная ошибка API запроса:', error.message, error.stack);
    
    return { ...getMockSearchResults(params.query), fromMock: true };
  }
};

/**
 * Get current API usage statistics for UI display
 */
export const getApiUsageStatistics = () => {
  return getApiUsageStats();
};
