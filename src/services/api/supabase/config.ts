
// Ключи для localStorage
const USE_SUPABASE_BACKEND_KEY = 'use_supabase_backend';
const FALLBACK_ENABLED_KEY = 'fallback_enabled';

/**
 * Проверяет, используется ли Supabase Backend
 */
export function isUsingSupabaseBackend(): boolean {
  const value = localStorage.getItem(USE_SUPABASE_BACKEND_KEY);
  return value === 'true';
}

/**
 * Устанавливает использование Supabase Backend
 */
export function setUseSupabaseBackend(value: boolean): void {
  localStorage.setItem(USE_SUPABASE_BACKEND_KEY, value.toString());
}

/**
 * Проверяет, включен ли фоллбэк на прямые вызовы
 */
export function isFallbackEnabled(): boolean {
  const value = localStorage.getItem(FALLBACK_ENABLED_KEY);
  return value === 'true';
}

/**
 * Устанавливает использование фоллбэка
 */
export function setFallbackEnabled(value: boolean): void {
  localStorage.setItem(FALLBACK_ENABLED_KEY, value.toString());
}

/**
 * Сбрасывает настройки Supabase до значений по умолчанию
 */
export function resetSupabaseSettings(): void {
  localStorage.removeItem(USE_SUPABASE_BACKEND_KEY);
  localStorage.removeItem(FALLBACK_ENABLED_KEY);
}
