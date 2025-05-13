
import { CORS_HEADERS } from "../config.ts";

// API ключ для Abacus из переменных окружения
const ABACUS_API_KEY = Deno.env.get('ABACUS_API_KEY');

/**
 * Обработчик запросов к Abacus API
 */
export async function handleAbacusRequest(req: Request, params: any) {
  // Проверяем наличие API ключа
  if (!ABACUS_API_KEY) {
    return new Response(JSON.stringify({ error: 'ABACUS_API_KEY не настроен' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Пока просто возвращаем заглушку для проверки работоспособности
    return new Response(JSON.stringify({ 
      status: "success", 
      message: "Abacus API интеграция работает"
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Ошибка при вызове Abacus API:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ошибка при вызове Abacus API"
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
}
