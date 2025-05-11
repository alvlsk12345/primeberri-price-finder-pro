
// Конфигурационные константы для Edge Function
export const EDGE_FUNCTION_CONFIG = {
  functionName: 'ai-proxy',
  requiredSecrets: ['OPENAI_API_KEY', 'ABACUS_API_KEY'],
  supabaseDocsUrl: 'https://supabase.com/docs/guides/functions'
};

// CORS заголовки для всех запросов
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Опции по умолчанию для запросов к OpenAI
export const DEFAULT_OPENAI_OPTIONS = {
  model: "gpt-4o",
  temperature: 0.2,
  max_tokens: 500
};

// Базовый URL для API Abacus
export const ABACUS_API_BASE_URL = 'https://api.abacus.ai';
