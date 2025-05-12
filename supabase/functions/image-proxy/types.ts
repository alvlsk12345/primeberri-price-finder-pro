
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
  // Добавляем дополнительное поле для информации о кэшировании
  cacheInfo?: {
    cached: boolean;
    source: string;
  };
  // Добавляем информацию о переадресации
  redirectInfo?: {
    wasRedirected: boolean;
    originalUrl?: string;
    redirectUrl?: string;
  }
}

// Добавляем типы для источников изображений
export type ImageSource = 'google' | 'zylalabs' | 'standard' | 'unknown';

// Интерфейс для настроек загрузки изображений
export interface ImageLoadOptions {
  directFetch?: boolean;
  bypassCache?: boolean;
  forceProxy?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
  // Добавляем опцию для отслеживания переадресаций
  followRedirects?: boolean;
  // Максимальное количество переадресаций
  maxRedirects?: number;
}
