
// Типы данных для image-proxy Edge Function

export interface ResponseOptions {
  headers?: Record<string, string>;
  status?: number;
  statusText?: string;
}

export interface CacheCheckResult {
  exists: boolean;
  url?: string;
  error?: string;
}
