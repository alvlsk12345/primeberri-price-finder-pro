
// Обработчик для запросов к OpenAI
import { CORS_HEADERS, DEFAULT_OPENAI_OPTIONS } from '../config.ts';

/**
 * Обрабатывает запросы к OpenAI API через Edge Function
 * @param params Параметры запроса (промпт и опции)
 * @param OPENAI_API_KEY API ключ OpenAI
 * @returns Promise с объектом Response
 */
export async function handleOpenAIRequest({
  prompt,
  options = {}
}: {
  prompt: string;
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    responseFormat?: "json_object" | "text";
  } 
}, OPENAI_API_KEY: string) {
  // Проверяем наличие ключа API
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Устанавливаем параметры запроса
    const {
      model = DEFAULT_OPENAI_OPTIONS.model,
      temperature = DEFAULT_OPENAI_OPTIONS.temperature,
      max_tokens = DEFAULT_OPENAI_OPTIONS.max_tokens,
      responseFormat = "text",
    } = options;
    
    // Формируем тело запроса
    const requestBody: {
      model: string;
      temperature: number;
      max_tokens: number;
      messages: { role: string; content: string }[];
      response_format?: { type: string };
    } = {
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
