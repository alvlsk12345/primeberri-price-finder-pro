
import { 
  ZYLALABS_API_KEY, 
  REQUEST_TIMEOUT, 
  getApiBaseUrl,
  RETRY_DELAY
} from "../zylalabsConfig";
import { handleApiError } from "../errorHandlerService";
import { toast } from "@/components/ui/sonner";

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
    // Setup headers exactly as in Postman collection - Using proper Bearer token format
    const headers: HeadersInit = {
      'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Log the request for debugging
    console.log('Making API request to:', url);
    console.log('Using API key (first 10 chars):', ZYLALABS_API_KEY.substring(0, 10) + '...');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      signal: controller.signal,
      // Ensure we're sending the request correctly
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store' // Disable caching to ensure fresh data
    });
    
    // Clear timeout once request is complete
    clearTimeout(timeoutId);
    
    // Log response status
    console.log(`API response status: ${response.status}, ok: ${response.ok}`);
    
    if (!response.ok) {
      // Try to get the error details for better debugging
      let errorText = '';
      try {
        errorText = await response.text();
        console.error("API Error Response Text:", errorText, "Status:", response.status);
        
        // Try to parse as JSON for structured error info
        const errorData = JSON.parse(errorText);
        console.error("API Error Data:", errorData);
        
        // Check for specific error types
        if (errorData.message) {
          if (errorData.message.includes('exceeded the allowed limit') || 
              errorData.message.includes('limit exceeded')) {
            toast.error('Превышен лимит запросов к API. Пожалуйста, попробуйте позже.');
          } else if (response.status === 503) {
            toast.error('API сервис временно недоступен. Используем демо-данные.');
          } else {
            toast.error(`Ошибка API: ${errorData.message}`);
          }
        }
      } catch (e) {
        // If parsing fails, use text response as is
        console.error("Could not parse error response:", e);
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse successful response
    const jsonResponse = await response.json();
    console.log("API response received successfully");
    
    return jsonResponse;
  } catch (error: any) {
    // If error is related to request timeout
    if (error.name === 'AbortError') {
      console.error('API request timeout');
      toast.error('Запрос к API занял слишком много времени. Используем демо-данные.');
      throw new Error('API request timeout');
    }
    
    // Clean up and re-throw
    clearTimeout(timeoutId);
    console.error("API request failed:", error.message);
    throw error;
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
