
import { 
  ZYLALABS_API_KEY, 
  REQUEST_TIMEOUT, 
  getApiBaseUrl 
} from "../zylalabsConfig";

/**
 * Makes a fetch request to the Zylalabs API with proper error handling
 */
export const fetchFromZylalabs = async (
  url: string, 
  proxyIndex: number = 0
): Promise<any> => {
  // Set up request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    // Set up request headers - exactly matching Postman configuration
    const headers: HeadersInit = {
      'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add any additional headers needed for proxy
    if (proxyIndex > 0) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    console.log('Отправляем запрос к Zylalabs API с параметрами:');
    console.log('URL запроса:', url);
    console.log('Используемый прокси индекс:', proxyIndex);
    console.log('Заголовок авторизации: Bearer', ZYLALABS_API_KEY ? ZYLALABS_API_KEY.substring(0, 5) + '...' : 'отсутствует');
    
    const response = await fetch(url, {
      method: 'GET', // Using GET as specified in Postman collection
      headers: headers,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    // Clear timeout once request is complete
    clearTimeout(timeoutId);
    
    // Log response status
    console.log(`API response status: ${response.status}, ok: ${response.ok}`);
    
    // Handle error responses
    if (!response.ok) {
      // Try to get the full error text for diagnostics
      const responseText = await response.text();
      console.error("API Error Response:", responseText);
      
      try {
        // Attempt to parse response as JSON for more detailed error info
        const errorData = JSON.parse(responseText);
        console.error("API Error Data:", errorData);
        
        // Если это ошибка от Zylalabs API с полем message и success=false
        if (errorData.success === false && errorData.message) {
          console.error('API error message:', errorData.message);
          throw new Error(`API error: ${errorData.message}`);
        }
      } catch (e) {
        // If parsing as JSON fails, use text as is
        console.error('Не удалось распарсить ошибку как JSON:', e);
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse the successful response
    const jsonResponse = await response.json();
    console.log('API response successfully parsed to JSON:', 
      jsonResponse.success ? 'success=true' : 'success=false', 
      jsonResponse.response ? 'response present' : 'no response');
    return jsonResponse;
  } catch (e) {
    console.error('Ошибка при выполнении запроса к API:', e);
    clearTimeout(timeoutId);
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Gets the appropriate API base URL based on the proxy index
 */
export const getZylalabsApiUrl = (urlPath: string, proxyIndex: number = 0): string => {
  const baseUrl = getApiBaseUrl(proxyIndex);
  return `${baseUrl}${urlPath}`;
};
