
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
      JSON.stringify({ error: 'OpenAI API key is not configured' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  try {
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
        max_tokens: 1000
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
    
    // Извлекаем JSON из ответа
    let jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = content.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('Не удалось извлечь JSON из ответа OpenAI:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse OpenAI response as JSON' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    // Пытаемся распарсить JSON
    try {
      const suggestions = JSON.parse(jsonMatch[0]);
      return new Response(
        JSON.stringify(suggestions),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } catch (error) {
      console.error('Error parsing JSON from OpenAI response:', error);
      // Если не удалось распарсить, возвращаем текстовый ответ
      return new Response(
        JSON.stringify({ error: 'Failed to parse OpenAI response', content }),
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
