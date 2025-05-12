
import { getRequestHeadersForSource, detectImageSource } from "./config.ts";
import { checkCache, saveToCache } from "./cache.ts";
import { ProxyResult } from "./types.ts";
import { isImage } from "./utils.ts";

/**
 * Загружает изображение с удаленного URL, используя нужные заголовки в зависимости от источника
 * @param url URL изображения для загрузки
 * @param bypassCache Флаг обхода кэша
 * @param forceDirectFetch Флаг принудительной прямой загрузки
 * @returns Результат загрузки изображения
 */
export async function loadImage(
  url: string, 
  bypassCache: boolean = false,
  forceDirectFetch: boolean = false
): Promise<ProxyResult> {
  try {
    if (!url) {
      return { success: false, statusText: "URL не указан" };
    }
    
    // Логируем запрос
    console.log("Загрузка изображения:", { 
      url,
      bypassCache,
      forceDirectFetch,
      source: detectImageSource(url)
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
    const headers = getRequestHeadersForSource(url);
    
    console.log("Определен источник изображения:", {
      source,
      headersKeys: Object.keys(headers)
    });
    
    // Устанавливаем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      // Выполняем запрос с соответствующими заголовками
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        cache: bypassCache || forceDirectFetch ? "no-store" : "default"
      });
      
      // Очищаем таймаут
      clearTimeout(timeoutId);
      
      // Проверяем успешность ответа
      if (!response.ok) {
        console.error("Ошибка загрузки изображения:", {
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
      
      // Получаем тип контента и блоб из ответа
      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      // Проверяем, что это действительно изображение
      if (!isImage(url, contentType)) {
        console.error("Неверный тип контента:", contentType);
        return {
          success: false,
          status: 415,
          statusText: "Неподдерживаемый тип контента"
        };
      }
      
      // Получаем блоб данных
      const blob = await response.blob();
      
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
        }
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
      console.error("Ошибка при запросе изображения:", fetchError);
      return {
        success: false,
        status: 500,
        statusText: fetchError.message || "Ошибка при загрузке изображения"
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
