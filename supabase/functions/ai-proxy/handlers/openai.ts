
// Обработчик запросов к OpenAI API через Supabase Edge Function
import { CORS_HEADERS } from '../config.ts';

// API ключ для OpenAI из переменных окружения
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Обработчик запросов к OpenAI API
 */
export async function handleOpenAIRequest(params: any) {
  // Проверяем наличие API ключа
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY не настроен');
  }
  
  // Обрабатываем разные типы запросов
  if (params.action === 'getBrandSuggestions') {
    return await handleBrandSuggestions(params);
  } else if (params.prompt) {
    // Стандартный запрос к OpenAI API
    return await callOpenAIDirectly(params.prompt, params.options);
  } else {
    throw new Error('Неверный формат запроса к OpenAI');
  }
}

/**
 * Обработчик запросов на получение предложений брендов
 */
async function handleBrandSuggestions(params: { description: string; count?: number }) {
  const { description, count = 6 } = params;
  console.log(`Запрос к OpenAI с описанием: ${description}`);
  
  // Формируем промпт для OpenAI
  const prompt = `Ты эксперт по брендам и товарам. Назови ${count} популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 

ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON. Не возвращай один объект, только массив объектов.

Формат ответа должен быть таким:
[
  {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
  {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"}
]`;

  // Вызываем OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка от OpenAI API:', errorText);
    throw new Error(`Ошибка OpenAI API: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  console.log(`OpenAI ответ получен, длина: ${content.length}`);
  
  // Парсим ответ и формируем структурированный результат
  try {
    // Проверяем, является ли content строкой или объектом
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Проверяем, содержит ли ответ массив products или это просто массив
    let products = [];
    
    if (Array.isArray(parsedContent)) {
      // Если ответ уже является массивом
      products = parsedContent;
    } else if (parsedContent && typeof parsedContent === 'object') {
      // Если это объект, ищем в нем массив (может быть под разными ключами)
      if ('products' in parsedContent) {
        products = parsedContent.products;
      } else if ('suggestions' in parsedContent) {
        products = parsedContent.suggestions;
      } else if ('brands' in parsedContent) {
        products = parsedContent.brands;
      } else if ('items' in parsedContent) {
        products = parsedContent.items;
      }
    }
    
    // Проверяем, что products - это массив
    if (!Array.isArray(products)) {
      console.error('Некорректный формат ответа от OpenAI, возвращается пустой массив');
      return { suggestions: [] };
    }
    
    console.log(`Успешно получен массив products: ${products.length}`);
    
    // Возвращаем результат в нужном формате
    return {
      suggestions: products.map(item => ({
        brand: item.brand || item.name || 'Неизвестный бренд',
        product: item.product || '',
        description: item.description || 'Описание недоступно',
      }))
    };
  } catch (error) {
    console.error('Ошибка при парсинге ответа от OpenAI:', error, 'Ответ:', content);
    throw new Error(`Ошибка при парсинге ответа: ${error.message}`);
  }
}

/**
 * Прямой вызов OpenAI API
 */
async function callOpenAIDirectly(prompt: string, options: any = {}) {
  const defaultOptions = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 500,
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // Формируем тело запроса
  const requestBody: any = {
    model: finalOptions.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: finalOptions.temperature,
    max_tokens: finalOptions.max_tokens,
  };

  // Если задан формат JSON, добавляем соответствующий параметр
  if (finalOptions.responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
  }
  
  // Отправляем запрос к OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка OpenAI API: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  return content;
}
