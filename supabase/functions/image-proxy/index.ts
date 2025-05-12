
import { corsHeaders } from './config.ts';
import { 
  logMessage, 
  LogLevel,
  createResponse, 
  createErrorResponse, 
  getSupabaseClient,
  generateRequestId,
  generateCacheFileName,
  isZylalabsUrl,
  processZylalabsUrl,
  getImageRequestHeaders
} from './utils.ts';
import { loadImageFromCache, saveImageToCache } from './cache.ts';

// Обрабатывает запросы на проксирование изображений
Deno.serve(async (req) => {
  // Проверяем, что запрос использует метод GET или OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Генерируем уникальный ID запроса для отслеживания
  const requestId = generateRequestId();
  logMessage(LogLevel.INFO, `[${requestId}] Получен запрос на проксирование изображения`);

  try {
    // Получаем URL изображения из параметров запроса
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return createErrorResponse('URL изображения не указан', 400);
    }

    logMessage(LogLevel.INFO, `[${requestId}] Запрошено изображение: ${imageUrl}`);
    
    // Проверяем, является ли источник изображения от Zylalabs
    if (isZylalabsUrl(imageUrl)) {
      logMessage(LogLevel.INFO, `[${requestId}] Обнаружен источник Zylalabs, применяем специальную обработку`);
      
      // Обрабатываем URL Zylalabs для прямого доступа
      const processedUrl = processZylalabsUrl(imageUrl);
      
      // Для Zylalabs пробуем прямое перенаправление сначала
      try {
        const imageResponse = await fetch(processedUrl, {
          headers: getImageRequestHeaders(processedUrl)
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          logMessage(LogLevel.INFO, `[${requestId}] Zylalabs изображение загружено напрямую. Размер: ${imageData.byteLength} байт`);
          
          // Сохраняем в кэш для будущих запросов
          const cacheFileName = generateCacheFileName(imageUrl);
          await saveImageToCache(cacheFileName, new Uint8Array(imageData));
          
          return createResponse(imageData, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
            }
          });
        } else {
          logMessage(LogLevel.WARN, `[${requestId}] Не удалось загрузить Zylalabs изображение напрямую: ${imageResponse.status} ${imageResponse.statusText}`);
        }
      } catch (directError) {
        logMessage(LogLevel.WARN, `[${requestId}] Ошибка при прямой загрузке Zylalabs изображения:`, directError);
      }
    }
    
    // Пытаемся загрузить из кэша
    const cacheFileName = generateCacheFileName(imageUrl);
    const cachedImage = await loadImageFromCache(cacheFileName);
    
    if (cachedImage) {
      logMessage(LogLevel.INFO, `[${requestId}] Изображение найдено в кэше. Размер: ${cachedImage.byteLength} байт`);
      
      return createResponse(cachedImage, {
        headers: {
          'Content-Type': 'image/jpeg', // Предполагаем JPEG, можно улучшить определение типа
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT',
        }
      });
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение не найдено в кэше, загружаем`);
    
    // Загружаем изображение из источника
    const imageResponse = await fetch(imageUrl, {
      headers: getImageRequestHeaders(imageUrl)
    });
    
    if (!imageResponse.ok) {
      return createErrorResponse(`Не удалось загрузить изображение: ${imageResponse.status} ${imageResponse.statusText}`, 
        imageResponse.status, 
        { url: imageUrl }
      );
    }
    
    const contentType = imageResponse.headers.get('content-type');
    const imageData = await imageResponse.arrayBuffer();
    
    // Проверяем, что полученные данные действительно изображение
    if (!contentType?.startsWith('image/') && imageData.byteLength < 100) {
      return createErrorResponse(`Получены некорректные данные изображения`, 400, { 
        contentType, 
        size: imageData.byteLength,
        url: imageUrl
      });
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение успешно загружено. Размер: ${imageData.byteLength} байт, тип: ${contentType}`);
    
    // Сохраняем в кэш
    await saveImageToCache(cacheFileName, new Uint8Array(imageData));
    
    return createResponse(imageData, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
      }
    });
    
  } catch (error) {
    logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при проксировании изображения:`, error);
    return createErrorResponse(`Ошибка при проксировании изображения: ${error.message}`, 500);
  }
});
