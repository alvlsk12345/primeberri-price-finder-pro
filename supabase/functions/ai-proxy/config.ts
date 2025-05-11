
// Конфигурационные константы для Edge Function

// CORS заголовки для всех запросов
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Опции по умолчанию для запросов к OpenAI
export const DEFAULT_OPENAI_OPTIONS = {
  model: "gpt-4o",
  temperature: 0.2,
  max_tokens: 500
};

// Базовый URL для API Abacus
export const ABACUS_API_BASE_URL = 'https://api.abacus.ai';

// Таймауты для запросов (в миллисекундах)
export const TIMEOUTS = {
  DEFAULT: 15000,
  OPENAI: 20000
};
