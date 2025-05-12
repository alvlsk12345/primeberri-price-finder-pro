
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

export interface ProxyResult {
  success: boolean;
  contentType?: string;
  blob?: Blob;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  url?: string;
}

