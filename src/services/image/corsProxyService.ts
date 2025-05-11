
/**
 * Этот файл содержит функции для работы с прокси-сервером для обхода CORS-ограничений
 * Новая реализация использует Supabase Edge Functions
 */

import { needsProxying, getProxiedImageUrl } from './imageProxy';

/**
 * Возвращает имя текущего прокси
 */
export const getCurrentProxyName = (): string => {
  return "Supabase Edge Function Proxy";
};

/**
 * Заглушка для функции переключения прокси (теперь используется один прокси)
 */
export const switchToNextProxy = (): void => {
  console.log("Функция переключения прокси недоступна - используется Supabase Edge Function");
};

/**
 * Сброс индекса прокси (заглушка)
 */
export const resetProxyIndex = (): void => {
  console.log("Функция сброса прокси недоступна - используется Supabase Edge Function");
};

/**
 * Применяет CORS-прокси к URL если необходимо
 * @param url URL для обработки
 * @returns URL с прокси или оригинальный URL
 */
export const applyCorsProxy = (url: string): string => {
  return needsProxying(url) ? getProxiedImageUrl(url) : url;
};

/**
 * Заглушка для получения максимального количества попыток прокси
 */
export const getMaxProxyAttempts = (): number => {
  return 1;
};
