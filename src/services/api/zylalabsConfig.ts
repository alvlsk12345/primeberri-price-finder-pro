
// API configuration constants
export const ZYLALABS_API_KEY = "8112|xU0WDZhKkWVo7rczutXwzGKzEwBtNPhHbsAYbtrM";

// Request configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 2000; // 2 seconds between retries
export const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

// CORS proxies, reorganized by reliability and functionality
const CORS_PROXIES = [
  "", // Direct connection (no proxy)
  "https://api.allorigins.win/get?url=", // More reliable proxy with different encoding method
  "https://api.allorigins.win/raw?url=", // Raw version
  "https://corsproxy.io/?", // Secondary CORS proxy
  "https://proxy.cors.sh/", // Alternative CORS proxy
  "https://cors-anywhere.herokuapp.com/" // Tertiary CORS proxy (requires demo access)
];

// Create a function to build API URL with appropriate proxy
export const getApiBaseUrl = (proxyIndex: number = 0): string => {
  const proxy = CORS_PROXIES[proxyIndex % CORS_PROXIES.length];
  return `${proxy}https://api.zylalabs.com`;
};

// API URL builder with improved encoding
export const buildSearchUrl = (
  query: string, 
  country: string, 
  language: string, 
  page: number, 
  proxyIndex: number = 0
): string => {
  // Double-encode the query for certain proxies that decode the URL
  const encodedQuery = encodeURIComponent(query);
  const baseUrl = getApiBaseUrl(proxyIndex);
  
  // For specific proxies that need different format
  if (proxyIndex === 1) { // api.allorigins.win/get
    const targetUrl = `https://api.zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}&page=${page}&source=merchant`;
    return `${baseUrl}${encodeURIComponent(targetUrl)}`;
  }
  
  // Standard URL for most proxies
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
  // Используем первую страну из списка или 'gb', если список пустой
  const country = countries && countries.length > 0 ? countries[0] : 'gb';
  return buildSearchUrl(query, country, language, page, proxyIndex);
};

// Helper function to check API key presence
export const checkApiKey = (): boolean => {
  if (!ZYLALABS_API_KEY) {
    console.error('API ключ Zylalabs не настроен');
    return false;
  }
  return true;
};

// Helper function for introducing delay
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Get appropriate headers based on proxy index
export const getApiHeaders = (proxyIndex: number = 0): HeadersInit => {
  const headers: HeadersInit = {
    'Authorization': `Bearer ${ZYLALABS_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  };
  
  // Only add CORS-specific headers for direct connection or certain proxies
  if (proxyIndex === 0 || proxyIndex === 4 || proxyIndex === 5) {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['Origin'] = window.location.origin;
    headers['Referer'] = window.location.origin;
  }
  
  return headers;
};
