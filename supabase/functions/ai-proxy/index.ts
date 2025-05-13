
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOpenAIRequest } from "./handlers/openai.ts";
import { handleAbacusRequest } from "./handlers/abacus.ts";
import { handlePerplexityRequest } from "./handlers/perplexity.ts";
import { CORS_HEADERS } from "./config.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ABACUS_API_KEY = Deno.env.get('ABACUS_API_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

serve(async (req) => {
  // CORS preflight handler
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Проверка соединения с Edge Function
  if (req.method === 'GET') {
    console.log("Выполняется проверка соединения Edge Function");
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Edge Function is running' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  // Основная обработка запросов
  try {
    const { provider, prompt, endpoint, method, data } = await req.json();

    // Маршрутизация запроса к соответствующему обработчику
    if (provider === 'openai') {
      return await handleOpenAIRequest({ prompt, options: data }, OPENAI_API_KEY);
    } else if (provider === 'abacus') {
      return await handleAbacusRequest({ endpoint, method, data }, ABACUS_API_KEY);
    } else if (provider === 'perplexity') {
      // Передаем запрос в обработчик Perplexity
      return await handlePerplexityRequest({ 
        prompt, 
        options: data,
        action: data?.action,
        response_format: data?.response_format,
        description: data?.description
      }, PERPLEXITY_API_KEY);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error("Ошибка в Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } 
      }
    );
  }
});
