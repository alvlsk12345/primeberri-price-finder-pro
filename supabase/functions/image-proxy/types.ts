
/**
 * Типы для Edge Function image-proxy
 */

// Результат проверки кэша
export interface CacheCheckResult {
  exists: boolean;
  url?: string;
  error?: string;
}

// Конфигурация запроса к прокси
export interface ProxyRequestConfig {
  url: string;
  bypassCache: boolean;
  retryAttempt: number;
}

// Параметры ответа
export interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  statusText?: string;
}
