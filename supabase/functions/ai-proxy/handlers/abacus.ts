
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
    
    // Убедимся, что модель установлена как "sonar" и отсутствует параметр response_format
    if (requestData.model === "sonar-small") {
      requestData.model = "sonar";
      console.log("Модель изменена на 'sonar'");
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
    
    // Дополнительная обработка ответа для исправления содержимого
    if (responseData && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        // Пытаемся очистить JSON в контенте от возможных проблем
        const content = responseData.choices[0].message.content;
        console.log("Оригинальный ответ API:", content);
        
        // Попытаемся проверить и обработать JSON перед отправкой
        try {
          // Проверка корректности JSON путем парсинга
          JSON.parse(content);
          // Если парсинг прошел успешно, не изменяем контент
        } catch (jsonError) {
          console.log("Обнаружена проблема с JSON в ответе:", jsonError.message);
          
          // Попытка исправить незакрытые кавычки или другие распространенные проблемы
          let fixedContent = content;
          
          // Исправление незавершенных строк (ищем незакрытые кавычки)
          const quoteRegex = /"([^"\\]*(\\.[^"\\]*)*)$/;
          if (quoteRegex.test(fixedContent)) {
            fixedContent = fixedContent + '"';
            console.log("Исправлена незакрытая кавычка в JSON");
          }
          
          // Проверяем, что объект корректно закрыт
          if (fixedContent.trim().endsWith(",")) {
            fixedContent = fixedContent.slice(0, -1) + "}]}";
            console.log("Исправлен незакрытый объект в JSON");
          }
          
          // Если у нас всё еще проблемы с JSON, попробуем искусственно сформировать пустой результат
          try {
            JSON.parse(fixedContent);
            // Если парсинг прошел успешно, обновляем контент
            responseData.choices[0].message.content = fixedContent;
            console.log("JSON успешно исправлен");
          } catch (fixError) {
            console.log("Не удалось исправить JSON, возвращаем пустой массив", fixError.message);
            // Если исправить не удалось, возвращаем корректный пустой JSON
            responseData.choices[0].message.content = '{"products":[]}';
          }
        }
      } catch (contentError) {
        console.error("Ошибка при обработке содержимого ответа:", contentError);
        // В случае ошибки при обработке контента, устанавливаем пустой результат
        responseData.choices[0].message.content = '{"products":[]}';
      }
    }
    
    // Возвращаем обработанный ответ
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
    model: "sonar", // Используем модель sonar
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: description }
    ],
    temperature: 0.7,
    max_tokens: 300 // Ограничение в 300 токенов
  };
}

/**
 * Выполняет запрос к Perplexity API
 */
async function makePerplexityRequest(requestData: any, PERPLEXITY_API_KEY: string) {
  console.log('Отправка запроса к Perplexity API');
  
  try {
    // Если указана модель sonar-small, заменяем на sonar
    if (requestData.model === "sonar-small") {
      requestData.model = "sonar";
      console.log('Модель изменена на "sonar"');
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
