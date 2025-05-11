
import { CORS_HEADERS } from '../config.ts';

export interface OpenAIBrandSuggestion {
  brand: string;
  product: string;
  description: string;
}

// Обработчик запросов к OpenAI
export async function handleOpenAIRequest(params: any, apiKey?: string): Promise<Response> {
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  try {
    // Общий проброс запросов к OpenAI
    if (params.prompt !== undefined) {
      return await handleGenericOpenAIRequest(params, apiKey);
    }
    
    // Специфические действия
    const { action, description, count = 5 } = params;
    
    console.log(`Обработка OpenAI запроса: ${action}`, { description: description?.substring(0, 50) + '...' });

    // Обработка различных типов запросов
    if (action === 'getBrandSuggestions') {
      return await handleBrandSuggestions(description, apiKey, count);
    }

    // Если действие не поддерживается
    return new Response(
      JSON.stringify({ error: `Unsupported action: ${action}` }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('Error in handleOpenAIRequest:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing OpenAI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}

// Обработчик общих запросов к OpenAI
async function handleGenericOpenAIRequest(params: any, apiKey: string): Promise<Response> {
  try {
    const { prompt, options = {} } = params;
    
    // Устанавливаем параметры запроса
    const {
      model = "gpt-4o",
      temperature = 0.2,
      max_tokens = 500,
      responseFormat = "text",
    } = options;
    
    // Формируем тело запроса
    const requestBody: any = {
      model,
      temperature,
      max_tokens,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    };
    
    // Добавляем формат ответа, если задан JSON
    if (responseFormat === "json_object") {
      requestBody.response_format = { type: "json_object" };
    }
    
    console.log(`Отправка запроса к OpenAI API с параметрами:`, {
      model: model,
      temperature: temperature,
      max_tokens: max_tokens,
      responseFormat: responseFormat
    });
    
    // Выполняем запрос к API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Обрабатываем ответ
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error?.message || 'Unknown error from OpenAI';
      throw new Error(errorMessage);
    }
    
    // Получаем содержимое ответа
    const content = data.choices[0]?.message?.content;
    
    // Обрабатываем ответ в зависимости от формата
    if (responseFormat === "json_object") {
      try {
        return new Response(
          JSON.stringify(JSON.parse(content)),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      } catch (e) {
        console.warn('Failed to parse JSON from OpenAI response:', e);
        return new Response(
          JSON.stringify({ result: content }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
    }
    
    // Для текстового формата просто возвращаем содержимое
    return new Response(
      JSON.stringify({ result: content }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling OpenAI API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}

// Функция для получения предложений по брендам
async function handleBrandSuggestions(description: string, apiKey: string, count: number): Promise<Response> {
  try {
    // Создаем промпт, запрашивающий конкретное количество результатов
    const prompt = `
    Пользователь ищет товар и предоставил следующее описание: "${description}"
    
    Предложи ${count} конкретных товаров с указанием бренда и конкретной модели/названия, которые соответствуют этому описанию.
    
    Формат ответа должен быть строго в виде JSON массива объектов с полями:
    - brand: название бренда
    - product: название модели или продукта
    - description: краткое описание товара, 1-2 предложения
    `;

    // Отправляем запрос к OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Ты - ассистент по подбору товаров, который предлагает конкретные бренды и модели на основе описания пользователя.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" } // Указываем формат ответа как JSON
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('OpenAI response content:', content);
    
    // Пытаемся распарсить JSON напрямую, так как мы указали response_format: "json_object"
    try {
      const parsedContent = JSON.parse(content);
      
      // Проверяем, есть ли в ответе массив товаров
      if (Array.isArray(parsedContent)) {
        return new Response(
          JSON.stringify(parsedContent),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      } 
      
      // Проверяем, есть ли в ответе поле с массивом товаров
      if (parsedContent.products && Array.isArray(parsedContent.products)) {
        return new Response(
          JSON.stringify(parsedContent.products),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
      
      // Проверяем, есть ли в ответе поле suggestions или results
      if (parsedContent.suggestions && Array.isArray(parsedContent.suggestions)) {
        return new Response(
          JSON.stringify(parsedContent.suggestions),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
      
      if (parsedContent.results && Array.isArray(parsedContent.results)) {
        return new Response(
          JSON.stringify(parsedContent.results),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
      
      // Если это объект, но не найдены известные поля, возвращаем сам объект
      return new Response(
        JSON.stringify(parsedContent),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } catch (error) {
      console.error('Error parsing JSON from OpenAI response:', error);
      
      // Если не удалось распарсить как JSON, возвращаем ошибку
      return new Response(
        JSON.stringify({ error: 'Failed to parse OpenAI response as JSON', content }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
  } catch (error) {
    console.error('Error in handleBrandSuggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error getting brand suggestions' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
