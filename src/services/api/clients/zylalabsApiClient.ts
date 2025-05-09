
import { 
  ZYLALABS_API_KEY, 
  REQUEST_TIMEOUT, 
  getApiBaseUrl 
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
    // Set up request headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    };
    
    // Add any additional headers needed for proxy
    if (proxyIndex > 0) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    console.log('Отправляемые заголовки:', Object.keys(headers).join(', '));
    console.log('Используемый API ключ:', ZYLALABS_API_KEY.substring(0, 5) + '...');
    console.log('Полный URL запроса:', url);
    
    const response = await fetch(url, {
      method: 'GET',
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
      console.error("API Error Response Text:", responseText, "Status:", response.status);
      
      try {
        // Attempt to parse response as JSON for more detailed error info
        const errorData = JSON.parse(responseText);
        console.error("API Error Data:", errorData);
        
        // Check for usage limit exceeded
        if (errorData.message && (
          errorData.message.includes('exceeded the allowed limit') || 
          errorData.message.includes('limit exceeded')
        )) {
          console.error('API usage limit exceeded');
          toast.error('Превышен лимит запросов к API. Пожалуйста, обратитесь в поддержку.');
          throw new Error('API usage limit exceeded');
        }
      } catch (e) {
        // If parsing as JSON fails, use text as is
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse the successful response
    return await response.json();
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
