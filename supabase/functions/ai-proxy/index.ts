
// ai-proxy Edge Function для вызова внешних AI API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOpenAIRequest } from './handlers/openai.ts';
import { handleAbacusRequest } from './handlers/abacus.ts';
import { CORS_HEADERS } from './config.ts';

// Для безопасного хранения ключей API
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

// Обработчик запросов
serve(async (req) => {
  // CORS preflight обработка
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: CORS_HEADERS 
    });
  }
  
  try {
    // Пытаемся получить данные запроса с таймаутом для чтения тела
    let requestData;
    try {
      const requestText = await req.text();
      requestData = requestText ? JSON.parse(requestText) : {};
    } catch (e) {
      console.error('Ошибка при чтении тела запроса:', e);
      return new Response(
        JSON.stringify({ error: 'Ошибка чтения запроса: ' + e.message }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
      );
    }
    
    // Обработка проверки соединения
    if (requestData.testConnection === true) {
      console.log('Выполняется проверка соединения Edge Function');
      return new Response(
        JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    const { provider, ...params } = requestData;
    
    // Проверяем наличие провайдера для стандартных запросов
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
      );
    }
    
    console.log(`Обработка запроса через Edge Function для провайдера: ${provider}`, params);
    
    // В зависимости от провайдера вызываем соответствующую функцию
    let responseData;
    
    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY не настроен в Edge Function' }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
        );
      }
      
      responseData = await handleOpenAIRequest(params, OPENAI_API_KEY);
    } else if (provider === 'abacus' || provider === 'perplexity') {
      if (!PERPLEXITY_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'PERPLEXITY_API_KEY не настроен в Edge Function' }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
        );
      }
      
      // Используем обработчик Abacus/Perplexity
      responseData = await handleAbacusRequest(params, PERPLEXITY_API_KEY);
    } else {
      // Если провайдер не поддерживается, возвращаем ошибку
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
      );
    }
    
    // Возвращаем результат с CORS заголовками
    return responseData;
  } catch (error) {
    // Обработка ошибок
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
});
