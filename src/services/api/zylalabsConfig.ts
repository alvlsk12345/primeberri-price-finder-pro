
// API configuration constants
export const ZYLALABS_API_KEY = "8109|6Jvdck7HZmg7NdU3iQmwmKIuGSabv2S882fxhEA4";

// Request configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 2000; // 2 seconds between retries
export const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

// Корректный базовый URL из Postman коллекции
export const ZYLALABS_BASE_URL = "https://zylalabs.com";

// Alternative CORS proxies to try if direct access fails
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
  return `${proxy}${ZYLALABS_BASE_URL}`;
};

// API URL builder for single country search (точное соответствие Postman коллекции)
export const buildSearchUrl = (
  query: string, 
  country: string = 'us', // Значение по умолчанию из Postman
  language: string = 'en', // Значение по умолчанию из Postman
  page: number | null = null, // Необязательный параметр как в Postman
  proxyIndex: number = 0
): string => {
  const encodedQuery = encodeURIComponent(query);
  const baseUrl = getApiBaseUrl(proxyIndex);
  
  // Собираем URL точно как в Postman коллекции
  let url = `${baseUrl}/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}`;
  
  // Добавляем page только если он указан (как в Postman)
  if (page && page > 1) {
    url += `&page=${page}`;
  }
  
  return url;
};

// API URL builder for multi-country search
export const buildMultiCountrySearchUrl = (
  query: string, 
  countries: string[] = ['us'], // Значение по умолчанию из Postman
  language: string = 'en', 
  page: number | null = null, 
  proxyIndex: number = 0
): string => {
  // Use the first country from the list or 'us' as default (как в Postman)
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
