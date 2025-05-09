
// API configuration constants
export const ZYLALABS_API_KEY = "8103|qZi97eieReCKmFs6mwcg9Mf1H2JjJfGgdesU59tv";

// Request configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000;
export const REQUEST_TIMEOUT = 15000;

// API URL builder for single country search
export const buildSearchUrl = (query: string, country: string, language: string, page: number): string => {
  const encodedQuery = encodeURIComponent(query);
  return `https://zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?q=${encodedQuery}&country=${country}&language=${language}&page=${page}&source=merchant`;
};

// API URL builder for multi-country search
export const buildMultiCountrySearchUrl = (query: string, countries: string[], language: string, page: number): string => {
  // По умолчанию используем первую страну из списка или 'gb', если список пустой
  const country = countries && countries.length > 0 ? countries[0] : 'gb';
  return buildSearchUrl(query, country, language, page);
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
