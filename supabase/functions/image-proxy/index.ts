
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Заголовки CORS для всех ответов
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Время кэширования изображений в секундах (30 минут)
const CACHE_TIME = 1800;

// Список доменов, которые всегда требуют прокси из-за CORS-ограничений
const ALWAYS_PROXY_DOMAINS = [
  'encrypted-tbn',
  'googleusercontent.com',
  'gstatic.com',
  'ggpht.com',
];

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Получаем URL изображения из параметров запроса
  const url = new URL(req.url);
  const imageUrl = url.searchParams.get('url');

  // Проверяем, что URL предоставлен
  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: 'Не указан URL изображения в параметре запроса' }), 
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }

  try {
    console.log(`Proxying image: ${imageUrl}`);
    
    // Проверяем, что URL валидный и безопасный
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
      new URL(decodedUrl); // Проверяем, что это валидный URL
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Невалидный URL изображения' }), 
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Опции для запроса изображения
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };
    
    // Запрашиваем изображение
    const imageResponse = await fetch(decodedUrl, fetchOptions);
    
    // Проверяем успешность запроса
    if (!imageResponse.ok) {
      console.error(`Ошибка при загрузке изображения: ${imageResponse.status} ${imageResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Не удалось загрузить изображение',
          status: imageResponse.status,
          statusText: imageResponse.statusText 
        }),
        {
          status: imageResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Получаем тип содержимого и бинарные данные
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    const imageBlob = await imageResponse.blob();
    
    // Возвращаем изображение с правильными заголовками
    return new Response(imageBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_TIME}`,
      }
    });

  } catch (error) {
    console.error(`Ошибка проксирования изображения: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Ошибка проксирования изображения: ${error.message}` }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
