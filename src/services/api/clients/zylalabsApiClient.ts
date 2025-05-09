
import { toast } from "@/components/ui/sonner";
import { ZYLALABS_API_KEY } from '../zylalabsConfig';

/**
 * Fetch data from Zylalabs API with proper error handling
 */
export const fetchFromZylalabs = async (url: string, proxyIndex: number = 0) => {
  console.log('Making API request to:', url);
  console.log('Using API key (first 10 chars):', ZYLALABS_API_KEY.substring(0, 10) + '...');
  
  try {
    // Set up headers with API key
    const headers = {
      'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    console.log('Headers:', headers);
    
    // Make API request with longer timeout and no caching
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      cache: 'no-store', // Completely disable cache
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Log detailed response info
    console.log('API response status:', response.status, 'ok:', response.ok);
    console.log('API response headers:', Object.fromEntries([...response.headers.entries()]));
    
    // Check for non-successful responses
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error('Raw error response:', errorText);
        
        // Try to parse as JSON for more detailed error
        try {
          const errorJson = JSON.parse(errorText);
          console.error('API Error Response:', errorJson, 'Status:', response.status);
          
          // Extract error message for user feedback
          const errorMessage = errorJson.message || errorJson.error || `Ошибка API: ${response.status}`;
          toast.error(errorMessage, {
            id: `api-error-${Date.now()}`,
            duration: 5000
          });
        } catch (e) {
          console.error('API Error (not JSON):', errorText, 'Status:', response.status);
          toast.error(`Ошибка API ${response.status}: ${errorText.substring(0, 100)}`, {
            id: `api-error-text-${Date.now()}`
          });
        }
      } catch (e) {
        errorText = 'Cannot extract error text';
        console.error('Failed to extract error text from response');
      }
      
      // Throw error to be caught by retry mechanism
      const error = new Error(`API error: ${response.status}`);
      throw error;
    }
    
    // Get response text first to debug
    const responseText = await response.text();
    console.log('Raw API response text (first 500 chars):', 
      responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Parse successful response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('API Response parsed successfully, data structure:', 
        Object.keys(data).join(', '));
      
      // Check if we have actual product data
      if (data && (!data.data?.products || data.data?.products?.length === 0) && 
          (!data.products || data.products?.length === 0)) {
        console.warn('API returned successful response but no products were found in the response');
        toast.warning('API вернул пустой список товаров. Проверьте поисковый запрос.');
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing API response JSON:', error);
      toast.error('Ошибка при обработке ответа API. Некорректный формат данных.');
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    // Handle fetch errors (network issues, timeouts, etc)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fetch error details:', error);
    
    if (errorMessage.includes('aborted')) {
      console.error('Request timed out after 30 seconds');
      toast.error('Запрос к API превысил время ожидания (30 секунд)');
    }
    
    // Don't show toast for every attempt as the retry mechanism will handle this
    if (proxyIndex === 2) { // Only show on the last attempt
      toast.error(`Не удалось соединиться с API. ${errorMessage}`, {
        id: `api-connection-error-${Date.now()}`
      });
    }
    
    throw error;
  }
};
