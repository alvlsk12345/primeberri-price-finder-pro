
import { corsHeaders, CACHE_TIME, ZYLALABS_REQUEST_HEADERS, GOOGLE_REQUEST_HEADERS, ENHANCED_REQUEST_HEADERS } from './config.ts';
import { 
  logMessage, 
  LogLevel,
  createResponse, 
  createErrorResponse, 
  getSupabaseClient,
  generateRequestId,
  generateCacheFileName,
  isZylalabsUrl,
  isGoogleUrl
} from './utils.ts';
import { proxyImage } from './imageLoader.ts';

// Имя бакета для хранения кэшированных изображений
const BUCKET_NAME = 'product-images';
const CACHE_PREFIX = 'cache/';

// Максимальный размер изображения для кэширования (10 МБ)
const MAX_CACHE_SIZE = 10 * 1024 * 1024;

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
    const bypassCache = url.searchParams.get('bypassCache') === 'true';
    
    if (!imageUrl) {
      return createErrorResponse('URL изображения не указан', 400);
    }

    logMessage(LogLevel.INFO, `[${requestId}] Запрошено изображение: ${imageUrl}, bypassCache: ${bypassCache}`);
    
    // Определяем источник изображения для применения специальных заголовков
    const isZylalabs = isZylalabsUrl(imageUrl);
    const isGoogle = isGoogleUrl(imageUrl);
    
    // Информация об источнике для логирования
    const sourceInfo = isZylalabs ? 'Zylalabs' : isGoogle ? 'Google' : 'Другой';
    logMessage(LogLevel.INFO, `[${requestId}] Обнаружен источник: ${sourceInfo}`);
    
    // Проверяем наличие изображения в кэше Supabase Storage, если не нужно обходить кэш
    if (!bypassCache) {
      const cacheFileName = generateCacheFileName(imageUrl);
      const supabaseAdmin = getSupabaseClient();
      const cachePath = `${CACHE_PREFIX}${cacheFileName}`;
      
      try {
        logMessage(LogLevel.INFO, `[${requestId}] Проверяем кэш для изображения: ${cachePath}`);
        
        const { data, error } = await supabaseAdmin
          .storage
          .from(BUCKET_NAME)
          .download(cachePath);
          
        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          const contentType = data.type || 'image/jpeg';
          
          logMessage(LogLevel.INFO, `[${requestId}] Изображение найдено в кэше. Размер: ${arrayBuffer.byteLength} байт, тип: ${contentType}`);
          
          return createResponse(arrayBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
              'X-Cache': 'HIT',
              'X-Source': sourceInfo
            }
          });
        } else {
          logMessage(LogLevel.INFO, `[${requestId}] Изображение не найдено в кэше: ${error?.message || 'нет данных'}`);
        }
      } catch (cacheError) {
        logMessage(LogLevel.WARN, `[${requestId}] Ошибка при проверке кэша:`, cacheError);
      }
    } else {
      logMessage(LogLevel.INFO, `[${requestId}] Кэш пропущен (bypassCache=true)`);
    }
    
    // Определяем заголовки в зависимости от источника
    let headers = ENHANCED_REQUEST_HEADERS;
    
    if (isZylalabs) {
      headers = ZYLALABS_REQUEST_HEADERS;
      logMessage(LogLevel.INFO, `[${requestId}] Используем заголовки Zylalabs`);
    } else if (isGoogle) {
      headers = GOOGLE_REQUEST_HEADERS;
      logMessage(LogLevel.INFO, `[${requestId}] Используем заголовки Google`);
    }
    
    // Загружаем изображение через специальный модуль
    logMessage(LogLevel.INFO, `[${requestId}] Загружаем изображение из источника: ${imageUrl}`);
    
    const imageResult = await proxyImage(imageUrl, requestId);
    
    if (!imageResult.success) {
      return createErrorResponse(
        `Не удалось загрузить изображение: ${imageResult.statusText || 'неизвестная ошибка'}`,
        imageResult.status || 500,
        { url: imageUrl, requestId }
      );
    }
    
    // Получаем бинарные данные изображения и тип содержимого
    const blob = imageResult.blob as Blob;
    const contentType = imageResult.contentType || 'image/jpeg';
    const imageData = new Uint8Array(await blob.arrayBuffer());
    
    // Проверяем, что полученные данные действительно изображение
    if (imageData.byteLength < 100) {
      return createErrorResponse(`Получены некорректные данные изображения`, 400, { 
        contentType, 
        size: imageData.byteLength,
        url: imageUrl,
        requestId
      });
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение успешно загружено. Размер: ${imageData.byteLength} байт, тип: ${contentType}`);
    
    // Сохраняем в кэш только если изображение не слишком большое
    if (imageData.byteLength <= MAX_CACHE_SIZE) {
      try {
        const cacheFileName = generateCacheFileName(imageUrl);
        const supabaseAdmin = getSupabaseClient();
        
        const { error } = await supabaseAdmin
          .storage
          .from(BUCKET_NAME)
          .upload(`${CACHE_PREFIX}${cacheFileName}`, imageData, {
            contentType: contentType,
            cacheControl: `max-age=${CACHE_TIME}`,
            upsert: true
          });
          
        if (error) {
          logMessage(LogLevel.WARN, `[${requestId}] Не удалось сохранить изображение в кэш:`, error);
        } else {
          logMessage(LogLevel.INFO, `[${requestId}] Изображение сохранено в кэш: ${cacheFileName}`);
        }
      } catch (cacheError) {
        logMessage(LogLevel.WARN, `[${requestId}] Ошибка при сохранении изображения в кэш:`, cacheError);
      }
    } else {
      logMessage(LogLevel.WARN, `[${requestId}] Изображение слишком большое для кэширования: ${imageData.byteLength} байт`);
    }
    
    // Возвращаем загруженное изображение клиенту
    return createResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
        'X-Source': sourceInfo
      }
    });
    
  } catch (error) {
    logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при проксировании изображения:`, error);
    return createErrorResponse(`Ошибка при проксировании изображения: ${error.message}`, 500);
  }
});
