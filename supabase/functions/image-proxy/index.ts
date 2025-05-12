
// Функция прокси для изображений с обходом CORS-ограничений и кэшированием
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, CACHE_TIME, PROXY_SUFFIX, getRequestHeadersForSource, detectImageSource, STORAGE_CONFIG } from "./config.ts";
import { ProxyResult, ResponseOptions, CacheCheckResult } from "./types.ts";
import { decodeBase64Url } from "./utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Создание клиента Supabase для доступа к Storage
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * Проверяет наличие изображения в кэше
 * @param originalUrl URL оригинального изображения
 * @returns Результат проверки кэша
 */
async function checkImageCache(originalUrl: string): Promise<CacheCheckResult> {
  try {
    if (!originalUrl) {
      return { exists: false, error: "No URL provided" };
    }

    // Создаем уникальное имя файла на основе URL
    const encodedUrl = encodeURIComponent(originalUrl);
    const fileName = `${STORAGE_CONFIG.CACHE_PREFIX}${encodedUrl.slice(0, 100)}-${btoa(originalUrl).replace(/[+/=]/g, '_')}`;

    // Проверяем наличие файла в хранилище
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_ID)
      .getPublicUrl(fileName);

    if (error) {
      console.log("Error checking cache:", error.message);
      return { exists: false, error: error.message };
    }

    // Если файл найден, возвращаем публичный URL
    if (data?.publicUrl) {
      console.log("Cache hit for:", originalUrl);
      return { exists: true, url: data.publicUrl };
    }

    console.log("Cache miss for:", originalUrl);
    return { exists: false };
  } catch (error) {
    console.error("Error in cache check:", error);
    return { exists: false, error: error.message };
  }
}

/**
 * Сохраняет изображение в кэш
 * @param originalUrl URL оригинального изображения
 * @param imageBlob Blob изображения для сохранения
 * @param contentType Тип контента изображения
 * @returns URL к кэшированному изображению или null при ошибке
 */
async function cacheImage(
  originalUrl: string,
  imageBlob: Blob,
  contentType: string
): Promise<string | null> {
  try {
    if (!originalUrl || !imageBlob) {
      return null;
    }

    // Пропускаем кэширование, если размер слишком большой
    if (imageBlob.size > STORAGE_CONFIG.MAX_CACHE_SIZE) {
      console.log(`Skipping cache: image too large (${imageBlob.size} bytes)`);
      return null;
    }

    // Создаем уникальное имя файла на основе URL
    const encodedUrl = encodeURIComponent(originalUrl);
    const fileName = `${STORAGE_CONFIG.CACHE_PREFIX}${encodedUrl.slice(0, 100)}-${btoa(originalUrl).replace(/[+/=]/g, '_')}`;

    // Преобразуем Blob в ArrayBuffer для загрузки
    const buffer = await imageBlob.arrayBuffer();

    // Загружаем файл в хранилище
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_ID)
      .upload(fileName, buffer, {
        contentType,
        cacheControl: `public, max-age=${CACHE_TIME}`,
        upsert: true,
      });

    if (error) {
      console.error("Error caching image:", error);
      return null;
    }

    // Получаем публичный URL для кэшированного изображения
    const { data: urlData } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_ID)
      .getPublicUrl(fileName);

    console.log("Image cached successfully:", {
      originalUrl,
      cachedUrl: urlData?.publicUrl,
      size: imageBlob.size,
      contentType
    });

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error("Cache error:", error);
    return null;
  }
}

/**
 * Загружает изображение с удаленного URL с правильными заголовками
 * @param url URL изображения
 * @param bypassCache Флаг обхода кэша
 * @param forceDirectFetch Флаг принудительной прямой загрузки
 * @returns Результат загрузки изображения
 */
async function fetchImageWithProxy(
  url: string,
  bypassCache: boolean = false,
  forceDirectFetch: boolean = false
): Promise<ProxyResult> {
  try {
    if (!url) {
      return { success: false };
    }
    
    console.log("Fetching image:", { 
      url, 
      bypassCache, 
      forceDirectFetch,
      source: detectImageSource(url)
    });

    // Проверяем кэш, если не требуется обход
    if (!bypassCache && !forceDirectFetch) {
      const cacheResult = await checkImageCache(url);
      if (cacheResult.exists && cacheResult.url) {
        console.log("Returning cached image:", cacheResult.url);
        return { 
          success: true, 
          url: cacheResult.url,
          cacheInfo: {
            cached: true,
            source: "supabase-storage"
          }
        };
      }
    }

    // Определяем источник изображения и выбираем соответствующие заголовки
    const source = detectImageSource(url);
    const requestHeaders = getRequestHeadersForSource(url);
    
    // Добавляем детальное логирование
    console.log("Image source detected:", { 
      source, 
      headers: Object.keys(requestHeaders),
      url
    });

    // Выполняем запрос с соответствующими заголовками
    const response = await fetch(url, {
      headers: requestHeaders,
      cache: bypassCache || forceDirectFetch ? "no-store" : "default",
    });

    if (!response.ok) {
      console.error("Image fetch error:", {
        status: response.status,
        statusText: response.statusText,
        url
      });
      return {
        success: false,
        status: response.status,
        statusText: response.statusText
      };
    }

    // Получаем тип контента и blob изображения
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const blob = await response.blob();

    // Кэшируем успешно загруженное изображение, если не требуется прямая загрузка
    let cachedUrl: string | null = null;
    if (!forceDirectFetch) {
      cachedUrl = await cacheImage(url, blob, contentType);
    }

    // Возвращаем результат с информацией о кэше
    return {
      success: true,
      contentType,
      blob,
      url: cachedUrl,
      cacheInfo: {
        cached: !!cachedUrl,
        source: cachedUrl ? "supabase-storage" : "direct"
      }
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      success: false,
      status: 500,
      statusText: error.message || "Internal Server Error"
    };
  }
}

/**
 * Отправляет ответ клиенту с заголовками CORS
 * @param result Результат обработки запроса
 * @param options Дополнительные опции ответа
 * @returns Response объект с данными и заголовками
 */
function sendResponse(
  result: ProxyResult,
  options: ResponseOptions = {}
): Response {
  const headers = {
    ...corsHeaders,
    ...options.headers,
  };

  if (result.success && result.blob) {
    // Если есть Blob, добавляем заголовок Content-Type
    if (result.contentType) {
      headers["Content-Type"] = result.contentType;
    }

    // Если есть кэшированный URL, отправляем редирект
    if (result.url) {
      return new Response(null, {
        status: 302,
        headers: {
          ...headers,
          Location: result.url,
          "Cache-Control": `public, max-age=${CACHE_TIME}`,
        },
      });
    }

    // Иначе отправляем Blob напрямую
    return new Response(result.blob, {
      status: 200,
      headers: {
        ...headers,
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
      },
    });
  }

  // В случае ошибки отправляем соответствующий статус
  const status = options.status || result.status || 500;
  const statusText = options.statusText || result.statusText || "Error";

  return new Response(
    JSON.stringify({ 
      error: statusText,
      details: result.cacheInfo
    }),
    {
      status,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    }
  );
}

// Обработчик запросов
serve(async (req: Request) => {
  // Обработка CORS preflight запросов
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Получаем параметры запроса
    const imageUrl = url.searchParams.get("url");
    const bypassCache = url.searchParams.get("bypassCache") === "true";
    const forceDirectFetch = url.searchParams.get("forceDirectFetch") === "true";

    // Логируем запрос для отладки
    console.log("Image proxy request:", { 
      imageUrl, 
      bypassCache, 
      forceDirectFetch,
      queryParams: Object.fromEntries(url.searchParams.entries())
    });

    // Проверяем наличие URL
    if (!imageUrl) {
      return sendResponse(
        { success: false },
        { status: 400, statusText: "URL parameter is required" }
      );
    }

    // Декодируем URL, если он закодирован в base64
    let decodedUrl = imageUrl;
    if (imageUrl.startsWith("base64:")) {
      decodedUrl = decodeBase64Url(imageUrl.substring(7));
      console.log("Decoded base64 URL:", { original: imageUrl, decoded: decodedUrl });
    }

    // Если URL содержит PROXY_SUFFIX, удаляем его для избежания зацикливания
    if (decodedUrl.includes(PROXY_SUFFIX)) {
      decodedUrl = decodedUrl.replace(PROXY_SUFFIX, "");
      console.log("Removed proxy suffix:", decodedUrl);
    }

    // Загружаем изображение с учетом параметров запроса
    const result = await fetchImageWithProxy(decodedUrl, bypassCache, forceDirectFetch);

    // Отправляем результат клиенту
    return sendResponse(result);
  } catch (error) {
    console.error("Server error:", error);
    
    return sendResponse(
      { success: false },
      { status: 500, statusText: error.message || "Internal Server Error" }
    );
  }
});
