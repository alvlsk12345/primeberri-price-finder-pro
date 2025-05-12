
import { getRequestHeadersForSource, detectImageSource, MAX_REDIRECTS } from "./config.ts";
import { checkCache, saveToCache } from "./cache.ts";
import { ProxyResult, ImageLoadOptions } from "./types.ts";
import { isImage } from "./utils.ts";

/**
 * Проверяет валидность URL для загрузки изображения
 * @param url URL для проверки
 * @returns Объект с результатом валидации
 */
function validateImageUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: "URL не указан" };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Невалидный URL формат" };
  }
}

/**
 * Проверяет наличие изображения в кэше
 * @param url URL изображения
 * @param bypassCache Флаг обхода кэша
 * @returns Объект с результатом проверки кэша
 */
async function checkImageCache(url: string, bypassCache: boolean): Promise<{ cached: boolean; cacheUrl?: string }> {
  if (bypassCache) {
    return { cached: false };
  }
  
  const cacheResult = await checkCache(url);
  if (cacheResult.exists && cacheResult.url) {
    console.log("Возвращаем кэшированное изображение:", cacheResult.url);
    return { cached: true, cacheUrl: cacheResult.url };
  }
  
  return { cached: false };
}

/**
 * Выполняет HTTP запрос для загрузки изображения
 * @param url URL изображения
 * @param headers HTTP заголовки
 * @param options Дополнительные опции запроса
 * @returns Объект с результатом запроса
 */
async function fetchImageWithTimeout(
  url: string, 
  headers: Record<string, string>, 
  options: { 
    signal?: AbortSignal; 
    cache?: RequestCache; 
    redirect?: RequestRedirect;
  }
): Promise<Response> {
  return await fetch(url, {
    headers,
    ...options
  });
}

/**
 * Обрабатывает ответ сервера, проверяя на корректность типа содержимого
 * @param response HTTP ответ
 * @param url URL изображения
 * @returns Объект с результатом обработки
 */
async function processResponse(
  response: Response, 
  url: string
): Promise<{ success: boolean; contentType?: string; blob?: Blob; error?: string; status?: number }> {
  // Проверяем успешность ответа
  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error: response.statusText
    };
  }
  
  // Получаем тип контента и блоб из ответа
  const contentType = response.headers.get("content-type") || "image/jpeg";
  
  // Проверяем, что это действительно изображение
  if (!isImage(url, contentType)) {
    return {
      success: false,
      status: 415,
      error: "Неподдерживаемый тип контента"
    };
  }
  
  // Получаем блоб данных
  try {
    const blob = await response.blob();
    return {
      success: true,
      contentType,
      blob
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      error: `Ошибка при получении blob: ${error.message}`
    };
  }
}

/**
 * Обрабатывает переадресации при загрузке изображения
 * @param url Исходный URL
 * @param headers HTTP заголовки
 * @param options Опции загрузки
 * @returns Результат загрузки изображения с учетом переадресаций
 */
async function handleRedirects(
  url: string,
  headers: Record<string, string>,
  options: ImageLoadOptions
): Promise<{
  response: Response | null;
  currentUrl: string;
  wasRedirected: boolean;
  redirectCount: number;
  error?: { status: number; message: string };
}> {
  const followRedirects = options.followRedirects !== false;
  const maxRedirects = options.maxRedirects || MAX_REDIRECTS;
  
  let redirectCount = 0;
  let currentUrl = url;
  let wasRedirected = false;
  let response = null;
  
  try {
    // Настраиваем контроллер для таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
    
    // Выполняем запрос с обработкой переадресаций
    while (redirectCount <= maxRedirects) {
      console.log(`Запрос к URL (попытка ${redirectCount + 1}/${maxRedirects + 1}):`, currentUrl);
      
      response = await fetchImageWithTimeout(
        currentUrl, 
        headers, 
        {
          signal: controller.signal,
          cache: options.bypassCache ? "no-store" : "default",
          redirect: followRedirects ? "follow" : "manual"
        }
      );
      
      // Если это не переадресация или мы не следуем переадресациям, прерываем цикл
      if (!response.redirected || !followRedirects || 
          !(response.status === 301 || response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308)) {
        break;
      }
      
      // Обрабатываем переадресацию
      const redirectUrl = response.headers.get("location");
      if (!redirectUrl) break;
      
      console.log("Переадресация обнаружена:", {
        from: currentUrl,
        to: redirectUrl,
        status: response.status
      });
      
      wasRedirected = true;
      currentUrl = new URL(redirectUrl, currentUrl).href;
      redirectCount++;
      
      // Если достигнут лимит переадресаций
      if (redirectCount > maxRedirects) {
        console.warn("Превышен лимит переадресаций:", maxRedirects);
        clearTimeout(timeoutId);
        return {
          response: null,
          currentUrl,
          wasRedirected,
          redirectCount,
          error: {
            status: 310,
            message: `Превышен лимит переадресаций (${maxRedirects})`
          }
        };
      }
    }
    
    // Очищаем таймаут
    clearTimeout(timeoutId);
    
    return {
      response,
      currentUrl,
      wasRedirected,
      redirectCount
    };
  } catch (error) {
    // Обработка ошибок
    if (error.name === "AbortError") {
      return {
        response: null,
        currentUrl,
        wasRedirected,
        redirectCount,
        error: {
          status: 408,
          message: "Таймаут при загрузке изображения"
        }
      };
    }
    
    return {
      response: null,
      currentUrl,
      wasRedirected,
      redirectCount,
      error: {
        status: 500,
        message: error.message || "Ошибка при загрузке изображения"
      }
    };
  }
}

/**
 * Загружает изображение с удаленного URL, используя нужные заголовки в зависимости от источника
 * @param url URL изображения для загрузки
 * @param bypassCache Флаг обхода кэша
 * @param forceDirectFetch Флаг принудительной прямой загрузки
 * @param options Дополнительные опции загрузки
 * @returns Результат загрузки изображения
 */
export async function loadImage(
  url: string, 
  bypassCache: boolean = false,
  forceDirectFetch: boolean = false,
  options: ImageLoadOptions = {}
): Promise<ProxyResult> {
  try {
    // Валидируем URL
    const validation = validateImageUrl(url);
    if (!validation.isValid) {
      return { 
        success: false, 
        statusText: validation.error || "Невалидный URL" 
      };
    }
    
    // Настройка параметров загрузки с учетом опций
    const loadOptions = {
      followRedirects: options.followRedirects !== false,
      maxRedirects: options.maxRedirects || MAX_REDIRECTS,
      timeout: options.timeout || 15000,
      bypassCache: bypassCache || forceDirectFetch,
      ...options
    };
    
    // Логируем запрос
    console.log("Загрузка изображения:", { 
      url,
      bypassCache,
      forceDirectFetch,
      source: detectImageSource(url),
      options: loadOptions
    });
    
    // Проверяем кэш, если не требуется обход
    if (!bypassCache && !forceDirectFetch) {
      const cacheCheck = await checkImageCache(url, bypassCache);
      if (cacheCheck.cached && cacheCheck.cacheUrl) {
        return {
          success: true,
          url: cacheCheck.cacheUrl,
          cacheInfo: {
            cached: true,
            source: "supabase-storage"
          }
        };
      }
    }
    
    // Определяем источник изображения для выбора заголовков
    const source = detectImageSource(url);
    const headers = options.headers || getRequestHeadersForSource(url);
    
    console.log("Определен источник изображения:", {
      source,
      headersKeys: Object.keys(headers),
      followRedirects: loadOptions.followRedirects
    });
    
    // Обрабатываем загрузку изображения с учетом переадресаций
    const fetchResult = await handleRedirects(url, headers, loadOptions);
    
    // Если возникла ошибка при загрузке
    if (fetchResult.error) {
      return {
        success: false,
        status: fetchResult.error.status,
        statusText: fetchResult.error.message,
        redirectInfo: fetchResult.wasRedirected ? {
          wasRedirected: fetchResult.wasRedirected,
          originalUrl: url,
          redirectUrl: fetchResult.currentUrl
        } : undefined
      };
    }
    
    // Если у нас нет ответа, возвращаем ошибку
    if (!fetchResult.response) {
      return {
        success: false,
        status: 500,
        statusText: "Ошибка загрузки: нет ответа от сервера"
      };
    }
    
    // Обрабатываем ответ
    const processResult = await processResponse(fetchResult.response, fetchResult.currentUrl);
    
    if (!processResult.success) {
      return {
        success: false,
        status: processResult.status,
        statusText: processResult.error,
        redirectInfo: fetchResult.wasRedirected ? {
          wasRedirected: fetchResult.wasRedirected,
          originalUrl: url,
          redirectUrl: fetchResult.currentUrl
        } : undefined
      };
    }
    
    // Кэшируем изображение, если не требуется прямая загрузка
    let cachedUrl: string | null = null;
    if (!forceDirectFetch && processResult.blob) {
      cachedUrl = await saveToCache(url, processResult.blob, processResult.contentType!);
    }
    
    // Возвращаем результат
    return {
      success: true,
      contentType: processResult.contentType,
      blob: processResult.blob,
      url: cachedUrl,
      cacheInfo: {
        cached: !!cachedUrl,
        source: cachedUrl ? "supabase-storage" : "direct"
      },
      redirectInfo: fetchResult.wasRedirected ? {
        wasRedirected: fetchResult.wasRedirected,
        originalUrl: url,
        redirectUrl: fetchResult.currentUrl
      } : undefined
    };
    
  } catch (error) {
    // Обработка общих ошибок
    console.error("Общая ошибка загрузчика изображений:", error);
    return {
      success: false,
      status: 500,
      statusText: error.message || "Внутренняя ошибка сервера"
    };
  }
}
