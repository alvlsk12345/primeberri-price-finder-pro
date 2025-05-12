
import { getRequestHeadersForSource, detectImageSource, MAX_REDIRECTS } from "./config.ts";
import { checkCache, saveToCache } from "./cache.ts";
import { ProxyResult, ImageLoadOptions } from "./types.ts";
import { isImage } from "./utils.ts";

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
    if (!url) {
      return { success: false, statusText: "URL не указан" };
    }
    
    // Настройка параметров загрузки с учетом опций
    const followRedirects = options.followRedirects !== false;
    const maxRedirects = options.maxRedirects || MAX_REDIRECTS;
    
    // Логируем запрос с расширенной информацией
    console.log("Загрузка изображения:", { 
      url,
      bypassCache,
      forceDirectFetch,
      source: detectImageSource(url),
      options
    });
    
    // Проверяем кэш, если не требуется обход
    if (!bypassCache && !forceDirectFetch) {
      const cacheResult = await checkCache(url);
      if (cacheResult.exists && cacheResult.url) {
        console.log("Возвращаем кэшированное изображение:", cacheResult.url);
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
    
    // Определяем источник изображения для выбора заголовков
    const source = detectImageSource(url);
    const headers = options.headers || getRequestHeadersForSource(url);
    
    console.log("Определен источник изображения:", {
      source,
      headersKeys: Object.keys(headers),
      followRedirects
    });
    
    // Устанавливаем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
    
    let response;
    let redirectCount = 0;
    let currentUrl = url;
    let wasRedirected = false;
    
    try {
      // Выполняем запрос с обработкой переадресаций
      while (redirectCount <= maxRedirects) {
        console.log(`Запрос к URL (попытка ${redirectCount + 1}/${maxRedirects + 1}):`, currentUrl);
        
        response = await fetch(currentUrl, {
          headers,
          signal: controller.signal,
          cache: bypassCache || forceDirectFetch ? "no-store" : "default",
          redirect: followRedirects ? "follow" : "manual"
        });
        
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
          break;
        }
      }
      
      // Очищаем таймаут
      clearTimeout(timeoutId);
      
      // Если у нас нет ответа, возвращаем ошибку
      if (!response) {
        return {
          success: false,
          status: 500,
          statusText: "Ошибка загрузки: нет ответа от сервера"
        };
      }
      
      // Проверяем успешность ответа
      if (!response.ok) {
        console.error("Ошибка загрузки изображения:", {
          status: response.status,
          statusText: response.statusText,
          url: currentUrl,
          wasRedirected,
          redirectCount
        });
        
        return {
          success: false,
          status: response.status,
          statusText: response.statusText,
          redirectInfo: wasRedirected ? {
            wasRedirected,
            originalUrl: url,
            redirectUrl: currentUrl
          } : undefined
        };
      }
      
      // Получаем тип контента и блоб из ответа
      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      // Проверяем, что это действительно изображение
      if (!isImage(currentUrl, contentType)) {
        console.error("Неверный тип контента:", {
          contentType,
          url: currentUrl
        });
        return {
          success: false,
          status: 415,
          statusText: "Неподдерживаемый тип контента",
          redirectInfo: wasRedirected ? {
            wasRedirected,
            originalUrl: url,
            redirectUrl: currentUrl
          } : undefined
        };
      }
      
      // Получаем блоб данных
      const blob = await response.blob();
      
      console.log("Успешно загружено изображение:", {
        url: currentUrl,
        contentType,
        size: blob.size,
        wasRedirected,
        redirectCount
      });
      
      // Кэшируем изображение, если не требуется прямая загрузка
      let cachedUrl: string | null = null;
      if (!forceDirectFetch) {
        cachedUrl = await saveToCache(url, blob, contentType);
      }
      
      // Возвращаем результат
      return {
        success: true,
        contentType,
        blob,
        url: cachedUrl,
        cacheInfo: {
          cached: !!cachedUrl,
          source: cachedUrl ? "supabase-storage" : "direct"
        },
        redirectInfo: wasRedirected ? {
          wasRedirected,
          originalUrl: url,
          redirectUrl: currentUrl
        } : undefined
      };
    } catch (fetchError) {
      // Очищаем таймаут в случае ошибки
      clearTimeout(timeoutId);
      
      // Отдельная обработка ошибки таймаута
      if (fetchError.name === "AbortError") {
        console.error("Загрузка прервана по таймауту:", url);
        return {
          success: false,
          status: 408,
          statusText: "Таймаут при загрузке изображения"
        };
      }
      
      // Обработка других ошибок
      console.error("Ошибка при запросе изображения:", {
        url,
        error: fetchError.message || fetchError,
        wasRedirected,
        redirectCount
      });
      return {
        success: false,
        status: 500,
        statusText: fetchError.message || "Ошибка при загрузке изображения",
        redirectInfo: wasRedirected ? {
          wasRedirected,
          originalUrl: url,
          redirectUrl: currentUrl
        } : undefined
      };
    }
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
