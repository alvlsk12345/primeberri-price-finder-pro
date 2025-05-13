
import { CORS_HEADERS } from "../config.ts";

// API ключ для Perplexity из переменных окружения
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

/**
 * Обработчик запросов к Perplexity API
 */
export async function handlePerplexityRequest(req: Request, params: any) {
  // Проверяем наличие API ключа
  if (!PERPLEXITY_API_KEY) {
    return new Response(JSON.stringify({ error: 'PERPLEXITY_API_KEY не настроен' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Пока просто возвращаем заглушку для проверки работоспособности
    return new Response(JSON.stringify({ 
      status: "success", 
      message: "Perplexity API интеграция работает"
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Ошибка при вызове Perplexity API:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ошибка при вызове Perplexity API"
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
}
