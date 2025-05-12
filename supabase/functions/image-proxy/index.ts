
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Заголовки CORS для всех ответов
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Время кэширования изображений в секундах (7 дней)
const CACHE_TIME = 7 * 24 * 60 * 60;

// Суффикс для определения проксированных URL
const PROXY_SUFFIX = '&proxied=true';

// Список доменов, которые всегда требуют прокси из-за CORS-ограничений
const ALWAYS_PROXY_DOMAINS = [
  'encrypted-tbn',
  'googleusercontent.com',
  'gstatic.com',
  'ggpht.com',
  'zylalabs.com'
];

// Создаем клиент Supabase
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Функция для генерации уникального имени файла в кэше
function generateCacheFileName(url: string): string {
  // Создаем хэш URL для имени файла
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  
  // Создаем хэш и преобразуем в hex-строку
  return Array.from(new Uint8Array(data))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32) + '.img';
}

// Функция для проверки наличия изображения в кэше
async function checkImageCache(url: string): Promise<string | null> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const bucketName = 'product-images';
    const path = `cache/${cacheFileName}`;
    
    // Проверяем наличие файла в хранилище
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(path);
    
    if (error) {
      console.log('Кэшированное изображение не найдено:', error.message);
      return null;
    }
    
    console.log('Найдено кэшированное изображение:', data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error('Ошибка при проверке кэша изображений:', err);
    return null;
  }
}

// Функция для сохранения изображения в кэш
async function saveImageToCache(url: string, imageBlob: Blob, contentType: string): Promise<string | null> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const bucketName = 'product-images';
    const path = `cache/${cacheFileName}`;
    
    // Сохраняем файл в хранилище
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(path, imageBlob, {
        contentType,
        cacheControl: `public, max-age=${CACHE_TIME}`,
        upsert: true
      });
    
    if (error) {
      console.error('Ошибка при сохранении изображения в кэш:', error.message);
      return null;
    }
    
    // Получаем публичный URL сохраненного файла
    const { data: urlData } = await supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(path);
    
    console.log('Изображение успешно сохранено в кэш:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Ошибка при сохранении изображения в кэш:', err);
    return null;
  }
}

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
  const bypassCache = url.searchParams.get('bypassCache') === 'true';

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
    console.log(`Запрос на проксирование изображения: ${imageUrl}`);
    
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
    
    // Если не требуется обход кэша, проверяем наличие изображения в кэше
    if (!bypassCache) {
      const cachedImageUrl = await checkImageCache(decodedUrl);
      if (cachedImageUrl) {
        // Перенаправляем на кэшированное изображение
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': cachedImageUrl,
            'Cache-Control': `public, max-age=${CACHE_TIME}`,
          }
        });
      }
    }

    // Опции для запроса изображения
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Добавляем таймаут для запроса
      signal: AbortSignal.timeout(10000) // 10 секунд таймаут
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
    
    // Сохраняем изображение в кэш, только если не запрошен обход кэша
    let cachedUrl = null;
    if (!bypassCache) {
      cachedUrl = await saveImageToCache(decodedUrl, imageBlob, contentType);
    }
    
    // Если успешно сохранили в кэш, перенаправляем на кэшированную версию
    if (cachedUrl && !bypassCache) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': cachedUrl,
          'Cache-Control': `public, max-age=${CACHE_TIME}`,
        }
      });
    }
    
    // Если не удалось сохранить в кэш или запрошен обход кэша, возвращаем изображение напрямую
    return new Response(imageBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${bypassCache ? 0 : CACHE_TIME}`,
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
