
import { toast } from "@/components/ui/sonner";
import { SearchParams } from "../types";
import { 
  ZYLALABS_API_KEY, 
  MAX_RETRY_ATTEMPTS, 
  RETRY_DELAY, 
  REQUEST_TIMEOUT, 
  checkApiKey, 
  buildMultiCountrySearchUrl, 
  sleep 
} from "./zylalabsConfig";
import { getMockSearchResults } from "./mockDataService";
import { parseApiResponse } from "./responseParserService";
import { handleApiError, handleFetchError } from "./errorHandlerService";

// Helper function to fetch data from the API
const fetchFromZylalabs = async (apiUrl: string): Promise<any> => {
  // Set up request headers
  const headers: HeadersInit = {
    'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    // Handle API errors
    if (!response.ok) {
      return handleApiError(response);
    }

    // Parse the response
    return await response.json();
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

// Function to search for products via Zylalabs API with pagination and retries
export const searchProductsViaZylalabs = async (params: SearchParams): Promise<any> => {
  // Check for API key
  if (!checkApiKey()) {
    console.log('API key not found, using mock data');
    return { ...getMockSearchResults(params.query), fromMock: true };
  }
  
  let attempts = 0;
  let lastError = null;
  let proxyIndex = 0; // Start with direct connection (no proxy)

  // Use countries from params or default to 'gb'
  const countries = params.countries || ['gb'];
  const language = params.language || 'en';
  const page = params.page || 1;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      console.log(`Sending request to Zylalabs API... (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`, params);
      console.log(`Using proxy ${proxyIndex}`);
      
      // Build URL for the request using the current proxy index
      const apiUrl = buildMultiCountrySearchUrl(params.query, countries, language, page, proxyIndex);
      console.log('Request URL:', apiUrl);
      
      // Using the fixed function call with just one argument - the API URL
      const data = await fetchFromZylalabs(apiUrl);
      
      // Parse and normalize the response
      try {
        const parsedResult = parseApiResponse(data);
        return { ...parsedResult, fromMock: false };
      } catch (error) {
        console.error('Error parsing response:', error);
        toast.warning('Received invalid data from API');
        return { ...getMockSearchResults(params.query), fromMock: true };
      }
    } catch (error: any) {
      // Handle request timeout
      if (error.name === 'AbortError') {
        console.warn('Request was aborted due to timeout, retrying');
        lastError = error;
        attempts++;
        await sleep(RETRY_DELAY);
        continue; // Try again
      }
      
      // Log and handle other errors
      console.error("Fetch error:", error);
      
      // If likely a CORS issue, try a different proxy
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('Got "Failed to fetch" error, trying another proxy');
        proxyIndex = (proxyIndex + 1) % 5; // Use all 5 proxies
      }
      
      // Increment attempt counter
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRY_ATTEMPTS) {
        console.log(`Retry ${attempts}/${MAX_RETRY_ATTEMPTS} in ${RETRY_DELAY}ms`);
        await sleep(RETRY_DELAY);
        continue; // Try again
      }
    }
  }
  
  // If all attempts failed, use mock data
  console.error('All request attempts exhausted:', lastError);
  toast.error('Failed to connect to search API. Using demo data.');
  
  // Show more details in console for debugging
  console.log('Last error details:', lastError);
  
  // Return mock data with fromMock flag
  return { ...getMockSearchResults(params.query), fromMock: true };
};
