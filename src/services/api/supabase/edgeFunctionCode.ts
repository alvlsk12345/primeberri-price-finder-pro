
// ПРИМЕЧАНИЕ: Этот файл содержит код Edge Function, 
// который нужно добавить в панели управления Supabase после подключения

/*
// ai-proxy Edge Function для вызова внешних AI API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Для безопасного хранения ключей API
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ABACUS_API_KEY = Deno.env.get('ABACUS_API_KEY');

// Обработчик запросов
serve(async (req) => {
  try {
    // Получаем параметры запроса
    const { provider, ...params } = await req.json();
    
    // Проверяем наличие провайдера
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // В зависимости от провайдера вызываем соответствующую функцию
    if (provider === 'openai') {
      return await handleOpenAIRequest(params);
    } else if (provider === 'abacus') {
      return await handleAbacusRequest(params);
    }
    
    // Если провайдер не поддерживается, возвращаем ошибку
    return new Response(
      JSON.stringify({ error: `Unsupported provider: ${provider}` }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    // Обработка ошибок
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Обработчик для запросов к OpenAI
async function handleOpenAIRequest({ prompt, options = {} }) {
  // Проверяем наличие ключа API
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  try {
    // Устанавливаем параметры запроса
    const {
      model = "gpt-4o",
      temperature = 0.2,
      max_tokens = 500,
      responseFormat = "text",
    } = options;
    
    // Формируем тело запроса
    const requestBody = {
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
    
    // Выполняем запрос к API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
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
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.warn('Failed to parse JSON from OpenAI response:', e);
        return new Response(
          JSON.stringify({ result: content }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Для текстового формата просто возвращаем содержимое
    return new Response(
      JSON.stringify({ result: content }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling OpenAI API' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Обработчик для запросов к Abacus
async function handleAbacusRequest({ endpoint, method = 'POST', requestData = {} }) {
  // Проверяем наличие ключа API
  if (!ABACUS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Abacus API key not configured' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  try {
    // Формируем полный URL эндпоинта
    const API_BASE_URL = 'https://api.abacus.ai';
    let fullUrl = `${API_BASE_URL}/${endpoint}`;
    
    // Для GET-запросов добавляем параметры в URL
    if (method === 'GET' && Object.keys(requestData).length > 0) {
      const params = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      fullUrl += `?${params.toString()}`;
    }
    
    // Формируем опции для запроса
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`
      }
    };
    
    // Добавляем тело запроса для POST-запросов
    if (method === 'POST' && Object.keys(requestData).length > 0) {
      fetchOptions.body = JSON.stringify(requestData);
    }
    
    // Выполняем запрос к API Abacus
    const response = await fetch(fullUrl, fetchOptions);
    
    // Обрабатываем ответ
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error || data.errorType || 'Unknown error from Abacus';
      throw new Error(errorMessage);
    }
    
    // Возвращаем результат запроса
    return new Response(
      JSON.stringify(data.result || data),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Abacus API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling Abacus API' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
*/

// ВАЖНО: Этот файл содержит код для справки - его нужно использовать при создании
// Edge Function в панели Supabase

// Шаги для установки:
// 1. В панели управления Supabase перейдите в раздел "Edge Functions"
// 2. Создайте новую функцию с названием "ai-proxy"
// 3. Скопируйте код выше в редактор функции
// 4. Добавьте секреты OPENAI_API_KEY и ABACUS_API_KEY в разделе "Секреты"
// 5. Разверните функцию

export const AI_PROXY_EDGE_FUNCTION_GUIDE = {
  functionName: 'ai-proxy',
  requiredSecrets: ['OPENAI_API_KEY', 'ABACUS_API_KEY'],
  supabaseDocsUrl: 'https://supabase.com/docs/guides/functions'
};
