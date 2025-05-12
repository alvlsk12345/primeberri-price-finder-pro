
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
    
    // Проверяем, является ли источник изображения от Zylalabs
    let isZylalabs = isZylalabsUrl(imageUrl);
    if (isZylalabs) {
      logMessage(LogLevel.INFO, `[${requestId}] Обнаружен источник Zylalabs, применяем специальную обработку`);
      
      // Если нужно обойти кэш или это первый запрос к Zylalabs
      if (bypassCache) {
        try {
          // Добавляем специальные заголовки для Zylalabs
          const headers = getImageRequestHeaders(imageUrl);
          logMessage(LogLevel.INFO, `[${requestId}] Загружаем изображение Zylalabs напрямую с заголовками:`, headers);
          
          const imageResponse = await fetch(imageUrl, { headers });
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.arrayBuffer();
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            
            logMessage(LogLevel.INFO, `[${requestId}] Zylalabs изображение загружено напрямую. Размер: ${imageData.byteLength} байт, тип: ${contentType}`);
            
            // Создаем кэш-файл для будущих запросов
            const cacheFileName = generateCacheFileName(imageUrl);
            const supabaseAdmin = getSupabaseClient();
            
            try {
              const { data, error } = await supabaseAdmin
                .storage
                .from('product-images')
                .upload(`cache/${cacheFileName}`, new Uint8Array(imageData), {
                  contentType,
                  cacheControl: 'max-age=604800',
                  upsert: true
                });
                
              if (error) {
                logMessage(LogLevel.WARN, `[${requestId}] Не удалось сохранить изображение в кэш:`, error);
              } else {
                logMessage(LogLevel.INFO, `[${requestId}] Изображение сохранено в кэш: ${data?.path}`);
              }
            } catch (cacheError) {
              logMessage(LogLevel.WARN, `[${requestId}] Ошибка при сохранении изображения в кэш:`, cacheError);
            }
            
            return createResponse(imageData, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'X-Cache': 'MISS',
                'X-Source': 'Zylalabs-Direct'
              }
            });
          } else {
            logMessage(LogLevel.WARN, `[${requestId}] Не удалось загрузить Zylalabs изображение напрямую: ${imageResponse.status} ${imageResponse.statusText}`);
          }
        } catch (directError) {
          logMessage(LogLevel.WARN, `[${requestId}] Ошибка при прямой загрузке Zylalabs изображения:`, directError);
        }
      }
    }
    
    // Проверяем наличие изображения в кэше Supabase Storage
    const cacheFileName = generateCacheFileName(imageUrl);
    const supabaseAdmin = getSupabaseClient();
    
    try {
      // Пытаемся получить изображение из хранилища
      if (!bypassCache) {
        logMessage(LogLevel.INFO, `[${requestId}] Проверяем кэш для изображения: ${cacheFileName}`);
        
        const { data, error } = await supabaseAdmin
          .storage
          .from('product-images')
          .download(`cache/${cacheFileName}`);
          
        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          const contentType = data.type || 'image/jpeg';
          
          logMessage(LogLevel.INFO, `[${requestId}] Изображение найдено в кэше. Размер: ${arrayBuffer.byteLength} байт, тип: ${contentType}`);
          
          return createResponse(arrayBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
              'X-Cache': 'HIT'
            }
          });
        } else {
          logMessage(LogLevel.INFO, `[${requestId}] Изображение не найдено в кэше: ${error?.message || 'нет данных'}`);
        }
      } else {
        logMessage(LogLevel.INFO, `[${requestId}] Кэш пропущен (bypassCache=true)`);
      }
    } catch (cacheError) {
      logMessage(LogLevel.WARN, `[${requestId}] Ошибка при проверке кэша:`, cacheError);
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Загружаем изображение из источника: ${imageUrl}`);
    
    // Загружаем изображение из источника
    const headers = getImageRequestHeaders(imageUrl);
    logMessage(LogLevel.INFO, `[${requestId}] Используем заголовки для запроса:`, headers);
    
    const imageResponse = await fetch(imageUrl, { headers });
    
    if (!imageResponse.ok) {
      return createErrorResponse(`Не удалось загрузить изображение: ${imageResponse.status} ${imageResponse.statusText}`, 
        imageResponse.status, 
        { url: imageUrl, requestId }
      );
    }
    
    const contentType = imageResponse.headers.get('content-type');
    const imageData = await imageResponse.arrayBuffer();
    
    // Проверяем, что полученные данные действительно изображение
    if (!contentType?.startsWith('image/') && imageData.byteLength < 100) {
      return createErrorResponse(`Получены некорректные данные изображения`, 400, { 
        contentType, 
        size: imageData.byteLength,
        url: imageUrl,
        requestId
      });
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение успешно загружено. Размер: ${imageData.byteLength} байт, тип: ${contentType}`);
    
    // Сохраняем в кэш
    try {
      const { error } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(`cache/${cacheFileName}`, new Uint8Array(imageData), {
          contentType: contentType || 'image/jpeg',
          cacheControl: 'max-age=604800',
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
