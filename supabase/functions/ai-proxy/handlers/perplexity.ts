
// Обработчик для запросов к Perplexity API
import { CORS_HEADERS } from '../config.ts';

/**
 * Обрабатывает запросы к Perplexity API через Edge Function
 * @param params Параметры запроса (prompt, опции)
 * @param PERPLEXITY_API_KEY API ключ Perplexity
 * @returns Promise с объектом Response
 */
export async function handlePerplexityRequest({ 
  prompt, 
  options = {},
  action = ''
}: {
  prompt?: string;
  options?: Record<string, any>;
  action?: string;
}, PERPLEXITY_API_KEY?: string) {
  // Проверяем наличие ключа API
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Perplexity API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Обрабатываем разные типы запросов
    if (action === 'getBrandSuggestions') {
      return await handleBrandSuggestions(params, PERPLEXITY_API_KEY);
    } else if (prompt) {
      // Объединяем параметры по умолчанию с переданными
      const mergedOptions = {
        model: "sonar",
        temperature: 0.1,
        max_tokens: 500,
        ...options
      };

      console.log('Отправляем запрос к Perplexity API:', {
        model: mergedOptions.model, 
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.max_tokens
      });

      // Формируем тело запроса
      const requestBody = {
        model: mergedOptions.model,
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по брендам и товарам.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.max_tokens,
        return_images: false,
        return_related_questions: false
      };

      // Отправляем запрос к API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      // Проверяем успешность запроса
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 401) {
          throw new Error("Недействительный API ключ Perplexity");
        }
        
        throw new Error(
          errorData?.error?.message || 
          `Ошибка API Perplexity: ${response.status} ${response.statusText}`
        );
      }

      // Получаем данные ответа
      const data = await response.json();
      
      // Извлекаем текст ответа
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("Получен пустой ответ от Perplexity AI");
      }
      
      // Возвращаем результат
      return new Response(
        JSON.stringify({ result: content }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    } else {
      throw new Error("Отсутствует обязательный параметр prompt или action");
    }
  } catch (error: any) {
    console.error("Ошибка при вызове Perplexity AI:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling Perplexity API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}

/**
 * Обработчик запросов на получение предложений брендов через Perplexity
 * Использует тот же формат запроса и ответа, что и OpenAI
 */
async function handleBrandSuggestions(params: { description: string; count?: number }, apiKey: string) {
  const { description, count = 6 } = params;
  console.log(`Запрос к Perplexity с описанием: ${description}`);
  
  // Формируем промпт для Perplexity аналогично OpenAI
  const prompt = `Ты эксперт по брендам и товарам. Назови ${count} популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 

ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON. Не возвращай один объект, только массив объектов.

Формат ответа должен быть таким:
[
  {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
  {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"}
]`;

  // Вызываем Perplexity API
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: 'Ты эксперт по брендам и товарам.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1024
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка от Perplexity API:', errorText);
    throw new Error(`Ошибка Perplexity API: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  console.log(`Perplexity ответ получен, длина: ${content.length}`);
  
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
      console.error('Некорректный формат ответа от Perplexity, возвращается пустой массив');
      return new Response(
        JSON.stringify({ suggestions: [] }), 
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    console.log(`Успешно получен массив products: ${products.length}`);
    
    // Возвращаем результат в том же формате, что и OpenAI
    return new Response(
      JSON.stringify({
        suggestions: products.map(item => ({
          brand: item.brand || item.name || 'Неизвестный бренд',
          product: item.product || '',
          description: item.description || 'Описание недоступно',
        }))
      }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('Ошибка при парсинге ответа от Perplexity:', error, 'Ответ:', content);
    throw new Error(`Ошибка при парсинге ответа: ${error.message}`);
  }
}
