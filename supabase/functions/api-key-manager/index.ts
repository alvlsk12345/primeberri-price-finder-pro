
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Заголовки CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

// Хранилище API ключей
const API_KEYS = {
  zylalabs: Deno.env.get('ZYLALABS_API_KEY') || '',
  openai: Deno.env.get('OPENAI_API_KEY') || '',
  perplexity: Deno.env.get('PERPLEXITY_API_KEY') || '',
  abacus: Deno.env.get('ABACUS_API_KEY') || '',
};

// Обработчик запросов
serve(async (req) => {
  // CORS preflight обработка
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Получаем провайдера из URL-параметров
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider');

    // Для GET запросов возвращаем ключ API
    if (req.method === 'GET') {
      // Проверяем, что провайдер указан
      if (!provider || !Object.keys(API_KEYS).includes(provider)) {
        return new Response(
          JSON.stringify({ error: 'Необходимо указать корректный провайдер' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Проверяем наличие ключа
      const apiKey = API_KEYS[provider as keyof typeof API_KEYS];
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: `API ключ для ${provider} не настроен` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Возвращаем ключ API
      return new Response(
        JSON.stringify({ key: apiKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    // Для POST запросов устанавливаем новый ключ API (не поддерживается в Edge Functions)
    else if (req.method === 'POST') {
      return new Response(
        JSON.stringify({ error: 'Сохранение ключей API не поддерживается через Edge Functions. Установите переменные окружения через панель управления Supabase.' }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    // Для DELETE запросов удаляем ключ API (не поддерживается в Edge Functions)
    else if (req.method === 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Удаление ключей API не поддерживается через Edge Functions. Управляйте переменными окружения через панель управления Supabase.' }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Для неподдерживаемых методов возвращаем ошибку
    return new Response(
      JSON.stringify({ error: `Метод ${req.method} не поддерживается` }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Обработка ошибок
    console.error('Ошибка API Key Manager:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Внутренняя ошибка сервера' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
