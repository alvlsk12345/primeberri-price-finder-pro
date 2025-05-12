
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { loadImage } from "./imageLoader.ts";
import { ProxyResult } from "./types.ts";

const validateImageRequest = (url: string | null): { isValid: boolean; errorResponse?: Response } => {
  if (!url) {
    return {
      isValid: false,
      errorResponse: new Response(
        JSON.stringify({ error: "URL параметр обязателен" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      )
    };
  }
  
  // Проверяем, является ли URL валидным
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      errorResponse: new Response(
        JSON.stringify({ error: "Невалидный URL" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      )
    };
  }
};

const handleImageProxyRequest = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");
    
    // Валидация параметров запроса
    const validation = validateImageRequest(imageUrl);
    if (!validation.isValid) {
      return validation.errorResponse!;
    }
    
    // Получаем дополнительные параметры
    const bypassCache = url.searchParams.get("bypassCache") === "true";
    const forceDirectFetch = url.searchParams.get("forceDirectFetch") === "true";
    
    console.log("Image proxy request:", {
      imageUrl,
      bypassCache,
      forceDirectFetch,
      queryParams: Object.fromEntries(url.searchParams.entries())
    });
    
    // Загружаем изображение с расширенными опциями
    const result: ProxyResult = await loadImage(imageUrl!, bypassCache, forceDirectFetch, {
      followRedirects: true,
      maxRedirects: 5,
      timeout: 20000 // Увеличенный таймаут для Zylalabs API
    });
    
    // Если возникла ошибка при загрузке
    if (!result.success) {
      console.error("Ошибка при обработке изображения:", {
        status: result.status,
        message: result.statusText,
        redirectInfo: result.redirectInfo
      });
      
      return new Response(
        JSON.stringify({ 
          error: result.statusText,
          status: result.status,
          redirectInfo: result.redirectInfo
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: result.status || 500 }
      );
    }
    
    // Если есть кэшированный URL в Supabase Storage
    if (result.url) {
      // Возвращаем перенаправление на кэшированное изображение
      return new Response(null, {
        status: 302,
        headers: {
          "Location": result.url,
          ...corsHeaders
        }
      });
    }
    
    // Если есть blob данные, возвращаем их напрямую
    if (result.blob && result.contentType) {
      return new Response(result.blob, {
        headers: {
          "Content-Type": result.contentType,
          "Cache-Control": "public, max-age=31536000",
          ...corsHeaders
        }
      });
    }
    
    // Если что-то пошло не так и у нас нет ни blob, ни URL
    return new Response(
      JSON.stringify({ error: "Не удалось обработать изображение" }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  } catch (error) {
    console.error("Критическая ошибка в image-proxy:", error);
    
    return new Response(
      JSON.stringify({ error: "Внутренняя ошибка сервера", details: error.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
};

// Обрабатываем все входящие запросы
serve(async (req: Request) => {
  // Обрабатываем CORS preflight запросы
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  // Проверяем, это запрос на проксирование изображения
  if (req.method === "GET") {
    return handleImageProxyRequest(req);
  }
  
  // Для всех других методов возвращаем ошибку
  return new Response(
    JSON.stringify({ error: "Метод не поддерживается" }),
    { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 405 }
  );
});
