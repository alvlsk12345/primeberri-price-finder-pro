
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
