
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
    
    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      // Add cache control to avoid caching issues
      cache: 'no-cache',
      // Add longer timeout
      signal: AbortSignal.timeout(15000)
    });
    
    // Log response status
    console.log('API response status:', response.status, 'ok:', response.ok);
    
    // Check for non-successful responses
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        // Try to parse as JSON for more detailed error
        try {
          const errorJson = JSON.parse(errorText);
          console.error('API Error Response Text:', errorText, 'Status:', response.status);
          
          // Extract error message for user feedback
          const errorMessage = errorJson.message || errorJson.error || `Ошибка API: ${response.status}`;
          toast.error(errorMessage, {
            id: `api-error-${Date.now()}`,
            duration: 5000
          });
        } catch (e) {
          console.error('API Error (not JSON):', errorText, 'Status:', response.status);
        }
      } catch (e) {
        errorText = 'Cannot extract error text';
        console.error('Failed to extract error text from response');
      }
      
      // Throw error to be caught by retry mechanism
      const error = new Error(`API error: ${response.status}`);
      console.error('API Error Data:', errorText && typeof errorText === 'string' ? 
        (errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText) : 'No error data');
      throw error;
    }
    
    // Parse successful response
    const data = await response.json();
    console.log('API Response received successfully, parsing...');
    
    return data;
  } catch (error) {
    // Handle fetch errors (network issues, timeouts, etc)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fetch error details:', error);
    
    // Don't show toast for every attempt as the retry mechanism will handle this
    if (proxyIndex === 2) { // Only show on the last attempt
      toast.error(`Не удалось соединиться с API. ${errorMessage}`, {
        id: `api-connection-error-${Date.now()}`
      });
    }
    
    throw error;
  }
};
