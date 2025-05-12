
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, CACHE_TIME } from "./config.ts";
import { createResponse, createErrorResponse } from "./utils.ts";
import { checkImageCache, saveImageToCache } from "./cache.ts";
import { proxyImage } from "./imageLoader.ts";

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return createResponse(null, {
      status: 204,
    });
  }

  try {
    // Получаем URL изображения из параметров запроса
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    const bypassCache = url.searchParams.get('bypassCache') === 'true';
    const retryAttempt = parseInt(url.searchParams.get('retryAttempt') || '0');

    // Проверяем, что URL предоставлен
    if (!imageUrl) {
      return createErrorResponse('Не указан URL изображения в параметре запроса', 400);
    }

    try {
      console.log(`Запрос изображения: ${imageUrl} (bypassCache: ${bypassCache}, retryAttempt: ${retryAttempt})`);
      
      // Проверяем, что URL валидный и безопасный
      let decodedUrl;
      try {
        decodedUrl = decodeURIComponent(imageUrl);
        new URL(decodedUrl); // Проверяем, что это валидный URL
      } catch (e) {
        return createErrorResponse('Невалидный URL изображения', 400);
      }
      
      // Если не требуется обход кэша, проверяем наличие изображения в кэше
      if (!bypassCache && retryAttempt === 0) {
        const cachedImageUrl = await checkImageCache(decodedUrl);
        if (cachedImageUrl) {
          console.log(`Возвращаем кэшированное изображение: ${cachedImageUrl}`);
          // Перенаправляем на кэшированное изображение
          return createResponse(null, {
            status: 302,
            headers: {
              'Location': cachedImageUrl,
              'Cache-Control': `public, max-age=${CACHE_TIME}`,
            }
          });
        }
      }

      // Получаем изображение через прокси
      const proxyResult = await proxyImage(decodedUrl);
      
      // Если произошла ошибка при получении изображения
      if (!proxyResult.success) {
        console.error('Проблема при получении изображения через прокси:', proxyResult);
        
        // Для диагностики возвращаем детальную информацию о проблеме
        return createErrorResponse(
          'Не удалось загрузить изображение', 
          proxyResult.status || 500,
          {
            status: proxyResult.status,
            statusText: proxyResult.statusText,
            headers: proxyResult.headers,
            url: proxyResult.url
          }
        );
      }
      
      // Успешно получили изображение
      // Сохраняем изображение в кэш, только если не запрошен обход кэша и не попытка повторной загрузки
      let cachedUrl = null;
      if (!bypassCache && retryAttempt === 0) {
        cachedUrl = await saveImageToCache(decodedUrl, proxyResult.blob!, proxyResult.contentType!);
      }
      
      // Если успешно сохранили в кэш, перенаправляем на кэшированную версию
      if (cachedUrl && !bypassCache && retryAttempt === 0) {
        console.log(`Перенаправляем на кэшированное изображение: ${cachedUrl}`);
        return createResponse(null, {
          status: 302,
          headers: {
            'Location': cachedUrl,
            'Cache-Control': `public, max-age=${CACHE_TIME}`,
          }
        });
      }
      
      // Если не удалось сохранить в кэш или запрошен обход кэша, возвращаем изображение напрямую
      console.log(`Возвращаем изображение напрямую, тип: ${proxyResult.contentType}, размер: ${proxyResult.blob!.size} байт`);
      return createResponse(proxyResult.blob!, {
        headers: {
          'Content-Type': proxyResult.contentType!,
          'Cache-Control': `public, max-age=${bypassCache ? 0 : CACHE_TIME}`,
        }
      });

    } catch (error) {
      console.error(`Ошибка проксирования изображения: ${error.message}`, error.stack);
      return createErrorResponse(
        `Ошибка проксирования изображения: ${error.message}`,
        500,
        { stack: error.stack, url: imageUrl }
      );
    }
  } catch (outerError) {
    console.error(`Критическая ошибка в Edge Function: ${outerError.message}`, outerError.stack);
    return createErrorResponse(
      `Критическая ошибка в Edge Function: ${outerError.message}`,
      500,
      { stack: outerError.stack }
    );
  }
});
