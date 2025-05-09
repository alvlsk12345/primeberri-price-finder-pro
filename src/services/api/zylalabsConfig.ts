
// API configuration constants
export const ZYLALABS_API_KEY = "8109|6Jvdck7HZmg7NdU3iQmwmKIuGSabv2S882fxhEA4";

// Request configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 2000; // 2 seconds between retries
export const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

// We're having connection issues, so let's try direct connection first
// and then use CORS proxies as fallbacks
const CORS_PROXIES = [
  "", // Direct connection (no proxy)
  "https://corsproxy.io/?", // Primary CORS proxy
  "https://api.allorigins.win/raw?url=", // Alternative CORS proxy
  "https://cors.eu.org/", // EU based CORS proxy
  "https://cors-anywhere.herokuapp.com/" // Original proxy that requires demo access
];

// Create a function to build API URL with appropriate proxy
export const getApiBaseUrl = (proxyIndex: number = 0): string => {
  const proxy = CORS_PROXIES[proxyIndex % CORS_PROXIES.length];
  return `${proxy}https://zylalabs.com`; 
};

// API URL builder for single country search - Making sure to follow the exact Postman format
export const buildSearchUrl = (
  query: string, 
  country: string = "us", // Default to US as in the Postman example
  language: string = "en", 
  page: number | null = null, // Making this optional as in Postman
  proxyIndex: number = 0
): string => {
  const encodedQuery = encodeURIComponent(query);
  const baseUrl = getApiBaseUrl(proxyIndex);
  
  // Exact path structure from Postman collection
  let url = `${baseUrl}/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}`;
  
  // Add page parameter only if it's provided
  if (page !== null && !isNaN(Number(page))) {
    url += `&page=${page}`;
  }
  
  return url;
};

// API URL builder for multi-country search
export const buildMultiCountrySearchUrl = (
  query: string, 
  countries: string[], 
  language: string, 
  page: number | null = null, 
  proxyIndex: number = 0
): string => {
  // Use the first country from the list or 'us' if the list is empty (matching Postman)
  const country = countries && countries.length > 0 ? countries[0] : 'us';
  return buildSearchUrl(query, country, language, page, proxyIndex);
};

// Helper function to check API key presence
export const checkApiKey = (): boolean => {
  if (!ZYLALABS_API_KEY) {
    console.error('API ключ Zylalabs не настроен');
    return false;
  }
  
  // Check for minimum length and format
  if (ZYLALABS_API_KEY.length < 10 || !ZYLALABS_API_KEY.includes('|')) {
    console.error('API ключ Zylalabs имеет неверный формат. Ожидается формат "id|key"');
    return false;
  }
  
  return true;
};

// Helper function for introducing delay
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
