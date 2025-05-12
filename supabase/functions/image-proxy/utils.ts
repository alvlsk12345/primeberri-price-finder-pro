
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ResponseOptions } from './types.ts';
import { corsHeaders } from './config.ts';

// Уровни логирования
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Создаем клиент Supabase
export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
};

// Расширенная система логирования
export function logMessage(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data || null,
  };
  
  // Вывод отформатированного лога
  if (level === LogLevel.ERROR) {
    console.error(`[${timestamp}] [${level}] ${message}`, data || '');
  } else if (level === LogLevel.WARN) {
    console.warn(`[${timestamp}] [${level}] ${message}`, data || '');
  } else {
    console.log(`[${timestamp}] [${level}] ${message}`, data || '');
  }
  
  return logEntry;
}

// Функция для генерации уникального имени файла в кэше
export function generateCacheFileName(url: string): string {
  // Создаем хэш URL для имени файла
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  
  // Создаем хэш и преобразуем в hex-строку
  return Array.from(new Uint8Array(data))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32) + '.img';
}

/**
 * Проверяет, является ли URL источником из Zylalabs
 */
export function isZylalabsUrl(url: string): boolean {
  return url.includes('zylalabs.com') || 
         url.includes('api.promptapi.com') || 
         url.includes('api.eu-central.promptapi.com');
}

/**
 * Обрабатывает URL изображения от Zylalabs для прямого доступа
 * Некоторые URL могут требовать дополнительной обработки
 */
export function processZylalabsUrl(url: string): string {
  if (!url) return url;
  
  // Логируем URL для отладки
  logMessage(LogLevel.INFO, `Обрабатываем URL Zylalabs: ${url}`);
  
  // Добавляем здесь особую обработку URL от Zylalabs если нужно
  return url;
}

/**
 * Создает объект Response с заголовками CORS
 * @param body Тело ответа
 * @param options Дополнительные опции ответа
 */
export function createResponse(
  body: BodyInit | null, 
  options: ResponseOptions = {}
) {
  const { headers = {}, status = 200, statusText } = options;

  return new Response(body, {
    headers: { ...corsHeaders, ...headers },
    status,
    statusText
  });
}

/**
 * Возвращает объект ошибки в формате JSON
 */
export function createErrorResponse(
  errorMessage: string, 
  status: number = 500, 
  additionalInfo: Record<string, any> = {}
) {
  logMessage(LogLevel.ERROR, errorMessage, additionalInfo);
  
  return createResponse(
    JSON.stringify({ 
      error: errorMessage,
      ...additionalInfo
    }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Генерирует уникальный идентификатор запроса
 */
export function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

/**
 * Добавляет нужные заголовки для запросов к изображениям
 */
export function getImageRequestHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };
  
  // Для Zylalabs источников добавляем дополнительные заголовки
  if (isZylalabsUrl(url)) {
    headers['Origin'] = 'https://zylalabs.com';
    headers['Referer'] = 'https://zylalabs.com/';
  }
  
  return headers;
}
