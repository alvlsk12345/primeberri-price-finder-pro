
// API configuration constants
export const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Request configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 2000; // 2 seconds between retries
export const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

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
  return `${proxy}https://api.zylalabs.com`;
};

// API URL builder for single country search
export const buildSearchUrl = (
  query: string, 
  country: string, 
  language: string, 
  page: number, 
  proxyIndex: number = 0
): string => {
  const encodedQuery = encodeURIComponent(query);
  const baseUrl = getApiBaseUrl(proxyIndex);
  
  // Ensure we're using the correct API endpoint
  return `${baseUrl}/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}&page=${page}&source=merchant`;
};

// API URL builder for multi-country search
export const buildMultiCountrySearchUrl = (
  query: string, 
  countries: string[], 
  language: string, 
  page: number, 
  proxyIndex: number = 0
): string => {
  // По умолчанию используем первую страну из списка или 'gb', если список пустой
  const country = countries && countries.length > 0 ? countries[0] : 'gb';
  return buildSearchUrl(query, country, language, page, proxyIndex);
};

// Helper function to check API key presence
export const checkApiKey = (): boolean => {
  if (!ZYLALABS_API_KEY) {
    console.error('API ключ Zylalabs не настроен');
    return false;
  }
  
  // Проверка на минимальную длину и формат
  if (ZYLALABS_API_KEY.length < 10 || !ZYLALABS_API_KEY.includes('|')) {
    console.error('API ключ Zylalabs имеет неверный формат. Ожидается формат "id|key"');
    return false;
  }
  
  return true;
};

// Helper function for introducing delay
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
