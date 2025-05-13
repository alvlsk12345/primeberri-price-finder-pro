
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, CACHE_TIME } from "./config.ts";
import { createResponse, createErrorResponse, generateRequestId, logMessage, LogLevel } from "./utils.ts";
import { checkImageCache, saveImageToCache } from "./cache.ts";
import { proxyImage } from "./imageLoader.ts";

serve(async (req) => {
  const requestId = generateRequestId();
  logMessage(LogLevel.INFO, `[${requestId}] Получен новый запрос: ${req.url}`, { method: req.method });
  
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    logMessage(LogLevel.DEBUG, `[${requestId}] Обработка CORS preflight запроса`);
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
      logMessage(LogLevel.WARN, `[${requestId}] Запрос без URL изображения`);
      return createErrorResponse('Не указан URL изображения в параметре запроса', 400);
    }

    logMessage(LogLevel.INFO, `[${requestId}] Запрос изображения: ${imageUrl}`, { 
      bypassCache, 
      retryAttempt 
    });
    
    // Проверяем, что URL валидный и безопасный
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
      new URL(decodedUrl); // Проверяем, что это валидный URL
    } catch (e) {
      logMessage(LogLevel.WARN, `[${requestId}] Невалидный URL изображения: ${imageUrl}`, { error: e.message });
      return createErrorResponse('Невалидный URL изображения', 400);
    }
    
    // Если не требуется обход кэша, проверяем наличие изображения в кэше
    if (!bypassCache && retryAttempt === 0) {
      const cacheResult = await checkImageCache(decodedUrl, requestId);
      if (cacheResult.exists && cacheResult.url) {
        logMessage(LogLevel.INFO, `[${requestId}] Возвращаем кэшированное изображение: ${cacheResult.url}`);
        // Перенаправляем на кэшированное изображение
        return createResponse(null, {
          status: 302,
          headers: {
            'Location': cacheResult.url,
            'Cache-Control': `public, max-age=${CACHE_TIME}`,
          }
        });
      } else if (cacheResult.error) {
        logMessage(LogLevel.WARN, `[${requestId}] Ошибка при проверке кэша: ${cacheResult.error}`);
        // Продолжаем выполнение и получаем изображение через прокси
      }
    }

    // Получаем изображение через прокси
    const proxyResult = await proxyImage(decodedUrl, requestId);
    
    // Если произошла ошибка при получении изображения
    if (!proxyResult.success) {
      logMessage(LogLevel.ERROR, `[${requestId}] Проблема при получении изображения через прокси:`, proxyResult);
      
      // Для диагностики возвращаем детальную информацию о проблеме
      return createErrorResponse(
        'Не удалось загрузить изображение', 
        proxyResult.status || 500,
        {
          status: proxyResult.status,
          statusText: proxyResult.statusText,
          headers: proxyResult.headers,
          url: proxyResult.url,
          requestId
        }
      );
    }
    
    // Успешно получили изображение
    // Сохраняем изображение в кэш, только если не запрошен обход кэша и не попытка повторной загрузки
    let cachedUrl = null;
    if (!bypassCache && retryAttempt === 0) {
      cachedUrl = await saveImageToCache(decodedUrl, proxyResult.blob!, proxyResult.contentType!, requestId);
    }
    
    // Если успешно сохранили в кэш, перенаправляем на кэшированную версию
    if (cachedUrl && !bypassCache && retryAttempt === 0) {
      logMessage(LogLevel.INFO, `[${requestId}] Перенаправляем на кэшированное изображение: ${cachedUrl}`);
      return createResponse(null, {
        status: 302,
        headers: {
          'Location': cachedUrl,
          'Cache-Control': `public, max-age=${CACHE_TIME}`,
        }
      });
    }
    
    // Если не удалось сохранить в кэш или запрошен обход кэша, возвращаем изображение напрямую
    logMessage(LogLevel.INFO, `[${requestId}] Возвращаем изображение напрямую, тип: ${proxyResult.contentType}, размер: ${proxyResult.blob!.size} байт`);
    return createResponse(proxyResult.blob!, {
      headers: {
        'Content-Type': proxyResult.contentType!,
        'Cache-Control': `public, max-age=${bypassCache ? 0 : CACHE_TIME}`,
      }
    });
  } catch (outerError) {
    logMessage(LogLevel.ERROR, `[${requestId}] Критическая ошибка в Edge Function: ${outerError.message}`, { 
      stack: outerError.stack 
    });
    return createErrorResponse(
      `Критическая ошибка в Edge Function: ${outerError.message}`,
      500,
      { stack: outerError.stack, requestId }
    );
  }
});
