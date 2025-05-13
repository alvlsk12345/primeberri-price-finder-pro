
import { CACHE_TIME } from './config.ts';
import { getSupabaseClient, generateCacheFileName, logMessage, LogLevel } from './utils.ts';
import { CacheCheckResult } from './types.ts';

// Имя бакета для хранения кэшированных изображений
const BUCKET_NAME = 'product-images';
const CACHE_PREFIX = 'cache/';

/**
 * Проверяет наличие изображения в кэше
 * @param url URL изображения
 * @param requestId Уникальный идентификатор запроса для логирования
 * @returns Объект с результатом проверки кэша
 */
export async function checkImageCache(url: string, requestId: string): Promise<CacheCheckResult> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const path = `${CACHE_PREFIX}${cacheFileName}`;
    
    logMessage(LogLevel.DEBUG, `[${requestId}] Проверка кэша для изображения: ${url}, путь: ${path}`);
    
    // Получаем клиент Supabase
    const supabaseAdmin = getSupabaseClient();
    
    // Проверяем наличие файла в хранилище
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    if (error) {
      logMessage(LogLevel.DEBUG, `[${requestId}] Кэшированное изображение не найдено: ${error.message}`);
      return { exists: false, error: error.message };
    }
    
    logMessage(LogLevel.INFO, `[${requestId}] Найдено кэшированное изображение: ${data.publicUrl}`);
    return { exists: true, url: data.publicUrl };
  } catch (err) {
    logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при проверке кэша изображений:`, err);
    return { exists: false, error: err.message };
  }
}

/**
 * Сохраняет изображение в кэш
 * @param url URL изображения
 * @param imageBlob Blob изображения
 * @param contentType MIME-тип изображения
 * @param requestId Уникальный идентификатор запроса для логирования
 * @returns URL кэшированного изображения или null
 */
export async function saveImageToCache(
  url: string, 
  imageBlob: Blob, 
  contentType: string,
  requestId: string
): Promise<string | null> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const path = `${CACHE_PREFIX}${cacheFileName}`;
    
    logMessage(LogLevel.DEBUG, `[${requestId}] Сохранение изображения в кэш: ${url}, путь: ${path}`);
    
    // Получаем клиент Supabase
    const supabaseAdmin = getSupabaseClient();
    
    // Сохраняем файл в хранилище
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(path, imageBlob, {
        contentType,
        cacheControl: `public, max-age=${CACHE_TIME}`,
        upsert: true
      });
    
    if (error) {
      logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при сохранении изображения в кэш:`, error);
      return null;
    }
    
    // Получаем публичный URL сохраненного файла
    const { data: urlData } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение успешно сохранено в кэш: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при сохранении изображения в кэш:`, err);
    return null;
  }
}
