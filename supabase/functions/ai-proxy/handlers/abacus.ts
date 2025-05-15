
// Обработчик для запросов к Perplexity API
import { CORS_HEADERS } from '../config.ts';
import { BrandSuggestion } from '../types.ts';

/**
 * Обрабатывает запросы к Perplexity API через Edge Function
 * @param params Параметры запроса
 * @param PERPLEXITY_API_KEY API ключ Perplexity
 * @returns Promise с объектом Response
 */
export async function handleAbacusRequest(params: any, PERPLEXITY_API_KEY?: string) {
  // Проверяем наличие ключа API
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Perplexity API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Определяем действие на основе параметров запроса
    if (params.action === 'getBrandSuggestions') {
      return await handleBrandSuggestionsRequest(params, PERPLEXITY_API_KEY);
    } else if (params.requestData && params.prompt) {
      // Обрабатываем запрос с предоставленными данными и промптом
      return await makePerplexityRequest(params.requestData, PERPLEXITY_API_KEY);
    } else {
      // Для необработанных запросов возвращаем ошибку
      return new Response(
        JSON.stringify({ error: 'Unsupported action or invalid parameters' }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
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

/**
 * Обработчик запросов для получения предложений брендов
 */
async function handleBrandSuggestionsRequest(params: any, PERPLEXITY_API_KEY: string) {
  console.log(`Обработка запроса на получение брендов с описанием: ${params.description}`);
  
  try {
    // Если в запросе переданы готовые requestData, используем их
    const requestData = params.requestData || createBrandSuggestionsRequestData(params.description, params.count || 6);
    
    // Убедимся, что модель установлена как "sonar-small" и отсутствует параметр response_format
    if (requestData.model === "sonar" || requestData.model === "llama-3-sonar-large-32k-chat") {
      requestData.model = "sonar-small";
    }
    
    // Обновим max_tokens до 300
    if (requestData.max_tokens > 300) {
      requestData.max_tokens = 300;
    }
    
    // Удаляем параметр response_format если он существует
    if (requestData.response_format) {
      delete requestData.response_format;
      console.log("Удален параметр response_format из запроса к Perplexity");
    }
    
    console.log("Данные запроса к Perplexity:", JSON.stringify(requestData, null, 2));
    
    // Выполняем запрос к Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
      throw new Error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
    }

    // Получаем ответ от Perplexity
    const responseData = await response.json();
    console.log("Получен ответ от Perplexity API");
    
    // Возвращаем полный ответ
    return new Response(
      JSON.stringify(responseData),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
    
  } catch (error) {
    console.error('Ошибка при получении предложений брендов от Perplexity:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ошибка при запросе к Perplexity API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}

/**
 * Создает данные запроса для получения предложений брендов
 */
function createBrandSuggestionsRequestData(description: string, count: number = 6) {
  const systemPrompt = `Ты - эксперт по электронным товарам и аксессуарам для мобильных устройств.
Твоя задача - предложить конкретные товары на основе описания пользователя.
Ответ ДОЛЖЕН содержать ТОЛЬКО JSON-массив products с объектами, где каждый объект имеет:
1. brand - название бренда (строка)
2. product - название модели или товара (строка)
3. description - краткое описание товара на русском языке (1-2 предложения)

Формат: {"products": [{"brand": "...", "product": "...", "description": "..."}]}

Всегда возвращай точно ${count} результатов. Не нумеруй результаты.`;

  return {
    model: "sonar-small", // Использование модели sonar-small
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: description }
    ],
    temperature: 0.7,
    max_tokens: 300 // Уменьшено с 1000 до 300
  };
}

/**
 * Выполняет запрос к Perplexity API
 */
async function makePerplexityRequest(requestData: any, PERPLEXITY_API_KEY: string) {
  console.log('Отправка запроса к Perplexity API');
  
  try {
    // Если указана старая модель, заменяем на sonar-small
    if (requestData.model === "sonar" || requestData.model === "llama-3-sonar-large-32k-chat") {
      requestData.model = "sonar-small";
      console.log('Модель изменена на "sonar-small"');
    }
    
    // Обновим max_tokens до 300
    if (requestData.max_tokens > 300) {
      requestData.max_tokens = 300;
      console.log('Уменьшено количество токенов до 300');
    }
    
    // Удаляем параметр response_format если он есть, так как он вызывает ошибку
    if (requestData.response_format) {
      delete requestData.response_format;
      console.log('Удален параметр response_format из запроса');
    }
    
    // Выполняем запрос к API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
      throw new Error(`Ошибка от API Perplexity ${response.status}: ${errorBody}`);
    }

    // Получаем и возвращаем результат
    const responseData = await response.json();
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('Ошибка при запросе к Perplexity API:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ошибка при запросе к Perplexity API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}
