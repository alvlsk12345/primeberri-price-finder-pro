
// Обработчик для запросов к Perplexity API
import { CORS_HEADERS } from '../config.ts';
import { BrandSuggestion } from '../types.ts';

/**
 * Обрабатывает запросы к Perplexity API через Edge Function
 * @param params Параметры запроса (endpoint, метод, данные)
 * @param PERPLEXITY_API_KEY API ключ Perplexity
 * @returns Promise с объектом Response
 */
export async function handleAbacusRequest({ 
  endpoint, 
  method = 'POST', 
  body = {} 
}: {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: Record<string, any>;
}, PERPLEXITY_API_KEY?: string) {
  // Проверяем наличие ключа API
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Perplexity API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Определяем действие на основе эндпоинта
    if (endpoint === 'getBrandSuggestions') {
      return await handlePerplexityRequest(
        { action: 'getBrandSuggestions', description: body.messages?.[1]?.content, count: 6 },
        PERPLEXITY_API_KEY
      );
    } else if (endpoint === 'generateText') {
      // Для генерации текста используем стандартный запрос к API Perplexity
      return await makePerplexityRequest(
        'chat/completions',
        body,
        PERPLEXITY_API_KEY
      );
    } else {
      // Для других эндпоинтов используем параметры напрямую
      return await makePerplexityRequest(
        endpoint,
        body,
        PERPLEXITY_API_KEY
      );
    }
  } catch (error) {
    console.error('Perplexity API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling Perplexity API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}

// Функция для выполнения запроса к Perplexity API
async function makePerplexityRequest(
  endpoint: string,
  body: Record<string, any>,
  PERPLEXITY_API_KEY: string
): Promise<Response> {
  const API_BASE_URL = 'https://api.perplexity.ai';
  
  // Формируем опции для запроса
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify(body)
  };
  
  console.log(`Отправка запроса к Perplexity API: ${endpoint}`);
  
  // Выполняем запрос к API Perplexity
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, fetchOptions);
  
  // Обрабатываем ответ
  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Unknown error from Perplexity';
    throw new Error(errorMessage);
  }
  
  // Возвращаем результат запроса
  return new Response(
    JSON.stringify(data),
    { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
  );
}

// Обработчик запросов к API Perplexity для получения предложений брендов
async function handlePerplexityRequest(
  params: { action: string; description?: string; count?: number },
  PERPLEXITY_API_KEY: string
): Promise<Response> {
  console.log(`Обработка Perplexity запроса: ${params.action}`, params);
  
  if (params.action === "getBrandSuggestions") {
    try {
      const suggestions = await getBrandSuggestionsWithPerplexity(
        params.description || "",
        params.count || 6,
        PERPLEXITY_API_KEY
      );
      
      return new Response(
        JSON.stringify(suggestions),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } catch (error) {
      console.error('Ошибка при получении предложений брендов:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Error getting brand suggestions' }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: `Неизвестное действие: ${params.action}` }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
    );
  }
}

// Функция для получения предложений брендов через API Perplexity
async function getBrandSuggestionsWithPerplexity(
  description: string,
  count: number = 6,
  PERPLEXITY_API_KEY: string
): Promise<any> {
  try {
    // Системный промпт
    const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно ${count} результатов. Не нумеруй результаты.`;

    console.log('Запрос к Perplexity с описанием:', description);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Таймаут 15 секунд

    // Модели Perplexity
    const modelToUse = "llama-3-sonar-large-32k-chat";

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
      throw new Error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;

    console.log("Perplexity ответ получен, длина:", content?.length || 0);
    if (!content) {
      console.error("Пустой ответ от Perplexity");
      return { choices: [] };
    }

    try {
      const data = JSON.parse(content);
      if (data && data.products && Array.isArray(data.products)) {
        console.log("Успешно получен массив products от Perplexity:", data.products.length);
        // Возвращаем результат в формате, совместимом с ожиданиями клиента
        return {
          choices: [
            {
              message: {
                content: JSON.stringify(data)
              }
            }
          ]
        };
      } else {
        console.error("Некорректный формат JSON от Perplexity или отсутствует массив 'products':", data);
        return { choices: [] };
      }
    } catch (error) {
      console.error("Ошибка при парсинге JSON от Perplexity:", error, "Полученный контент:", content);
      return { choices: [] };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("Запрос к Perplexity API был прерван по таймауту.");
    } else {
      console.error("Ошибка при получении предложений брендов от Perplexity:", error);
    }
    throw error;
  }
}
