
import { CACHE_TIME } from './config.ts';
import { getSupabaseClient, generateCacheFileName } from './utils.ts';

// Имя бакета для хранения кэшированных изображений
const BUCKET_NAME = 'product-images';
const CACHE_PREFIX = 'cache/';

/**
 * Проверяет наличие изображения в кэше
 * @param url URL изображения
 * @returns URL кэшированного изображения или null
 */
export async function checkImageCache(url: string): Promise<string | null> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const path = `${CACHE_PREFIX}${cacheFileName}`;
    
    // Получаем клиент Supabase
    const supabaseAdmin = getSupabaseClient();
    
    // Проверяем наличие файла в хранилище
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    if (error) {
      console.log('Кэшированное изображение не найдено:', error.message);
      return null;
    }
    
    console.log('Найдено кэшированное изображение:', data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error('Ошибка при проверке кэша изображений:', err);
    return null;
  }
}

/**
 * Сохраняет изображение в кэш
 * @param url URL изображения
 * @param imageBlob Blob изображения
 * @param contentType MIME-тип изображения
 * @returns URL кэшированного изображения или null
 */
export async function saveImageToCache(
  url: string, 
  imageBlob: Blob, 
  contentType: string
): Promise<string | null> {
  try {
    const cacheFileName = generateCacheFileName(url);
    const path = `${CACHE_PREFIX}${cacheFileName}`;
    
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
      console.error('Ошибка при сохранении изображения в кэш:', error.message);
      return null;
    }
    
    // Получаем публичный URL сохраненного файла
    const { data: urlData } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    console.log('Изображение успешно сохранено в кэш:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Ошибка при сохранении изображения в кэш:', err);
    return null;
  }
}
