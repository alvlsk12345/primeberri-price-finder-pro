
// Обработчик для запросов к Perplexity API
import { CORS_HEADERS } from '../config.ts';
import { Brand, BrandResponse } from '../types.ts';

/**
 * Обрабатывает запросы к Perplexity API через Edge Function
 * @param params Параметры запроса (prompt, опции, response_format)
 * @param PERPLEXITY_API_KEY API ключ Perplexity
 * @returns Promise с объектом Response
 */
export async function handlePerplexityRequest({ 
  prompt, 
  options = {},
  action = '',
  response_format = null, // Добавляем поддержку response_format
  description = '' // Для совместимости с getBrandSuggestions
}: {
  prompt?: string;
  options?: Record<string, any>;
  action?: string;
  response_format?: Record<string, any> | null;
  description?: string;
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
      // Используем специализированную функцию для получения предложений брендов
      const params = { 
        description: description || prompt || '', 
        count: options.count || 6,
        // Передаем response_format если он есть
        ...(response_format ? { response_format } : {})
      };
      
      console.log(`Вызов handleBrandSuggestions с параметрами:`, params);
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
        max_tokens: mergedOptions.max_tokens,
        response_format: response_format ? JSON.stringify(response_format).substring(0, 100) + '...' : 'не задан'
      });

      // Формируем тело запроса
      const requestBody: Record<string, any> = {
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
        // Больше не используем эти параметры, они могут конфликтовать с response_format
        // return_images: false,
        // return_related_questions: false
      };
      
      // Добавляем response_format в запрос, если он предоставлен
      if (response_format) {
        requestBody.response_format = response_format;
        console.log('Добавлен response_format к запросу Perplexity');
      }

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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          console.error('Не удалось распарсить ошибочный ответ от Perplexity как JSON:', errorText);
          errorData = { error: { message: errorText || 'Unknown error' } };
        }
        
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
      
      // Извлекаем содержимое ответа
      const contentRaw = data?.choices?.[0]?.message?.content;
      
      console.log('Получен ответ от Perplexity, тип:', typeof contentRaw);
      
      if (contentRaw === null || contentRaw === undefined) {
        console.warn('Получен пустой ответ от Perplexity:', data);
        throw new Error("Получен пустой ответ от Perplexity AI");
      }
      
      // Обрабатываем ответ в зависимости от response_format
      let result;
      
      if (response_format && 
          (response_format.type === 'json_object' || response_format.type === 'json_schema') && 
          typeof contentRaw === 'string') {
        // Если ожидается JSON и мы получили строку, пробуем её распарсить
        try {
          // Удаляем любые возможные маркеры markdown, если они есть
          const cleanContent = contentRaw
            .replace(/^```(?:json)?\s*/g, '')
            .replace(/```$/g, '')
            .trim();
            
          result = JSON.parse(cleanContent);
          console.log('Успешный парсинг JSON ответа от Perplexity');
        } catch (e) {
          console.error('Ошибка парсинга JSON ответа:', e, 'Сырой ответ:', contentRaw);
          // Если не удалось распарсить, возвращаем исходную строку
          result = contentRaw;
        }
      } else {
        // Для других форматов или если содержимое уже не строка, используем как есть
        result = contentRaw;
      }
      
      // Возвращаем результат
      return new Response(
        JSON.stringify({ result }),
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
async function handleBrandSuggestions(params: { 
  description: string; 
  count?: number;
  response_format?: Record<string, any>;
}, apiKey: string) {
  const { description, count = 6, response_format } = params;
  console.log(`Запрос к Perplexity с описанием: ${description}`);
  
  // Формируем промпт для Perplexity аналогично OpenAI
  const prompt = `Ты эксперт по брендам и товарам. Назови ${count} популярных брендов с конкретными товарами, которые могут соответствовать запросу: '${description}'. 

ОЧЕНЬ ВАЖНО: Твой ответ должен быть строго в формате массива JSON. Не возвращай один объект, только массив объектов.

Формат ответа должен быть таким:
[
  {"brand": "Название бренда 1", "product": "Название товара 1", "description": "Описание товара 1"},
  {"brand": "Название бренда 2", "product": "Название товара 2", "description": "Описание товара 2"}
]`;

  // Формируем requestBody для API запроса
  const requestBody: Record<string, any> = {
    model: 'sonar',
    messages: [
      { role: 'system', content: 'Ты эксперт по брендам и товарам.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1024
  };
  
  // Добавляем response_format, если он есть
  if (response_format) {
    requestBody.response_format = response_format;
    console.log('Добавлен response_format к запросу Perplexity в handleBrandSuggestions');
  } else {
    // Если нет пользовательского response_format, добавляем наш
    requestBody.response_format = { 
      type: "json_object" 
    };
    console.log('Добавлен стандартный response_format (json_object) к запросу Perplexity');
  }

  // Вызываем Perplexity API
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorText;
    try {
      const errorData = await response.json();
      errorText = JSON.stringify(errorData);
    } catch (e) {
      errorText = await response.text().catch(() => 'Не удалось получить текст ошибки');
    }
    console.error('Ошибка от Perplexity API:', errorText);
    throw new Error(`Ошибка Perplexity API: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const contentRaw = data.choices[0]?.message?.content || '[]';
  console.log(`Perplexity ответ получен, тип: ${typeof contentRaw}, длина: ${
    typeof contentRaw === 'string' ? contentRaw.length : 'объект'
  }`);
  
  // Парсим ответ и формируем структурированный результат
  try {
    let parsedContent;
    
    // Обрабатываем контент в зависимости от его типа
    if (typeof contentRaw === 'string') {
      // Убираем возможные маркеры markdown
      const cleanedContent = contentRaw
        .replace(/^```(?:json)?\s*/g, '')
        .replace(/```$/g, '')
        .trim();
      
      try {
        parsedContent = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Ошибка при парсинге JSON, пробуем очистить контент:', parseError);
        // Попытка упростить контент, если возможно (удалить экранирование и т.д.)
        const simplifiedContent = cleanedContent
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
        parsedContent = JSON.parse(simplifiedContent);
      }
    } else {
      // Если контент уже объект, используем его напрямую
      parsedContent = contentRaw;
    }
    
    // Проверяем, содержит ли ответ массив products или это просто массив
    let products: Brand[] = [];
    
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
      } else {
        // Если не найдено ни одно из известных полей, проверяем первый ключ
        const keys = Object.keys(parsedContent);
        if (keys.length > 0 && Array.isArray(parsedContent[keys[0]])) {
          products = parsedContent[keys[0]];
        }
      }
    }
    
    // Проверяем, что products - это массив
    if (!Array.isArray(products)) {
      console.error('Некорректный формат ответа от Perplexity, возвращается пустой массив. Ответ:', 
                   JSON.stringify(parsedContent).substring(0, 300));
      products = [];
    }
    
    console.log(`Успешно получен массив products: ${products.length}`);
    
    // Маппинг результатов для обеспечения единообразного формата
    const suggestions = products.map(item => ({
      brand: item.brand || item.name || 'Неизвестный бренд',
      product: item.product || '',
      description: item.description || 'Описание недоступно',
    }));
    
    // Возвращаем результат в том же формате, что и OpenAI
    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error: any) {
    console.error('Ошибка при парсинге ответа от Perplexity:', error, 'Ответ:', 
                 typeof contentRaw === 'string' ? contentRaw.substring(0, 300) : 'не строка');
    
    // Возвращаем ошибку с частичной информацией из ответа для отладки
    return new Response(
      JSON.stringify({ 
        error: `Ошибка при парсинге ответа: ${error.message}`,
        suggestions: [],
        debug: { 
          contentType: typeof contentRaw,
          contentPreview: typeof contentRaw === 'string' 
            ? contentRaw.substring(0, 100) 
            : JSON.stringify(contentRaw).substring(0, 100)
        }
      }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}
