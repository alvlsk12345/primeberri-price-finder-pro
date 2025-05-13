
// Вы можете изменить этот код, но не удаляйте и не изменяйте первую строку
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORS_HEADERS } from "./config.ts";
import { handleOpenAIRequest } from "./handlers/openai.ts";
import { handleAbacusRequest } from "./handlers/abacus.ts";
import { handlePerplexityRequest } from "./handlers/perplexity.ts";

// Хендлер для Edge Function
serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: CORS_HEADERS 
    });
  }

  // Для GET запросов возвращаем тестовый ответ для проверки доступности
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", message: "AI Proxy функция работает" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }

  try {
    // Для всех других запросов, пробуем получить тело запроса
    let requestData;
    const contentType = req.headers.get("content-type") || "";
    
    // Проверка на тестовое соединение
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.testConnection === true) {
        return new Response(JSON.stringify({ status: "ok", message: "Тестовое соединение успешно" }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      requestData = body;
    } else {
      requestData = {};
    }

    // Определение типа запроса и перенаправление на соответствующий обработчик
    const provider = requestData.provider || "openai";
    
    switch(provider) {
      case "openai":
        return await handleOpenAIRequest(req, requestData);
      case "abacus":
        return await handleAbacusRequest(req, requestData);
      case "perplexity":
        return await handlePerplexityRequest(req, requestData);
      default:
        throw new Error(`Неизвестный провайдер: ${provider}`);
    }
  } catch (error) {
    console.error("Ошибка в AI-proxy функции:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Внутренняя ошибка сервера",
      status: "error" 
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
});
