
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Создаем клиент Supabase
export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
};

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
  options: { 
    headers?: HeadersInit, 
    status?: number,
    statusText?: string
  } = {}
) {
  const { headers = {}, status = 200, statusText } = options;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

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
