
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { STORAGE_CONFIG } from "./config.ts";
import { CacheCheckResult } from "./types.ts";
import { hashUrl } from "./utils.ts";

// Создание клиента Supabase для доступа к Storage
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * Генерирует имя файла для кэширования на основе URL
 * @param url URL для кэширования
 * @returns Имя файла для кэша
 */
export function getCacheFileName(url: string): string {
  // Создаем хеш URL для использования в названии файла
  const urlHash = hashUrl(url);
  
  // Берем начало URL для улучшения читаемости файла
  let urlPrefix = encodeURIComponent(url).slice(0, 50);
  urlPrefix = urlPrefix.replace(/%/g, '');
  
  return `${STORAGE_CONFIG.CACHE_PREFIX}${urlPrefix}-${urlHash}`;
}

/**
 * Проверяет наличие изображения в кэше
 * @param url URL оригинального изображения
 * @returns Результат проверки кэша
 */
export async function checkCache(url: string): Promise<CacheCheckResult> {
  try {
    if (!url) {
      return { exists: false, error: "No URL provided" };
    }

    // Получаем имя файла для кэша
    const fileName = getCacheFileName(url);

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
      console.log("Cache hit for:", url);
      return { exists: true, url: data.publicUrl };
    }

    console.log("Cache miss for:", url);
    return { exists: false };
  } catch (error) {
    console.error("Error in cache check:", error);
    return { exists: false, error: error.message };
  }
}

/**
 * Сохраняет изображение в кэш
 * @param url URL оригинального изображения
 * @param imageBlob Blob изображения для сохранения
 * @param contentType Тип контента изображения
 * @returns URL к кэшированному изображению или null при ошибке
 */
export async function saveToCache(
  url: string,
  imageBlob: Blob,
  contentType: string
): Promise<string | null> {
  try {
    if (!url || !imageBlob) {
      return null;
    }

    // Пропускаем кэширование, если размер слишком большой
    if (imageBlob.size > STORAGE_CONFIG.MAX_CACHE_SIZE) {
      console.log(`Skipping cache: image too large (${imageBlob.size} bytes)`);
      return null;
    }

    // Получаем имя файла для кэша
    const fileName = getCacheFileName(url);

    // Преобразуем Blob в ArrayBuffer для загрузки
    const buffer = await imageBlob.arrayBuffer();

    // Загружаем файл в хранилище
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_ID)
      .upload(fileName, buffer, {
        contentType,
        cacheControl: "public, max-age=604800", // 7 дней
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
      originalUrl: url,
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
 * Удаляет изображение из кэша
 * @param url URL оригинального изображения
 * @returns true в случае успеха, false при ошибке
 */
export async function removeFromCache(url: string): Promise<boolean> {
  try {
    if (!url) return false;

    // Получаем имя файла для кэша
    const fileName = getCacheFileName(url);

    // Удаляем файл из хранилища
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_ID)
      .remove([fileName]);

    if (error) {
      console.error("Error removing from cache:", error);
      return false;
    }

    console.log("Image removed from cache:", url);
    return true;
  } catch (error) {
    console.error("Cache removal error:", error);
    return false;
  }
}
