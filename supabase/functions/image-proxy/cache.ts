
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
 * Загружает изображение из кэша
 * @param cacheFileName Имя файла в кэше
 * @returns ArrayBuffer с данными изображения или null
 */
export async function loadImageFromCache(cacheFileName: string): Promise<Uint8Array | null> {
  try {
    // Получаем клиент Supabase
    const supabaseAdmin = getSupabaseClient();
    
    // Загружаем файл из хранилища
    const { data, error } = await supabaseAdmin
      .storage
      .from('product-images')
      .download(`cache/${cacheFileName}`);
    
    if (error || !data) {
      return null;
    }
    
    // Преобразуем Blob в Uint8Array для Deno
    return new Uint8Array(await data.arrayBuffer());
  } catch (err) {
    logMessage(LogLevel.ERROR, `Ошибка при загрузке изображения из кэша:`, err);
    return null;
  }
}

/**
 * Сохраняет изображение в кэш
 * @param cacheFileName Имя файла в кэше
 * @param imageData Данные изображения
 * @returns true, если сохранение успешно
 */
export async function saveImageToCache(cacheFileName: string, imageData: Uint8Array): Promise<boolean> {
  try {
    // Получаем клиент Supabase
    const supabaseAdmin = getSupabaseClient();
    
    // Сохраняем файл в хранилище
    const { error } = await supabaseAdmin
      .storage
      .from('product-images')
      .upload(`cache/${cacheFileName}`, imageData, {
        contentType: 'image/jpeg', // Предполагаем JPEG по умолчанию
        cacheControl: `max-age=${CACHE_TIME}`,
        upsert: true
      });
    
    return !error;
  } catch (err) {
    logMessage(LogLevel.ERROR, `Ошибка при сохранении изображения в кэш:`, err);
    return false;
  }
}
