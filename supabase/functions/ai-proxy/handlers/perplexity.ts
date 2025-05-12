
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
  options = {} 
}: {
  prompt: string;
  options?: Record<string, any>;
}, PERPLEXITY_API_KEY?: string) {
  // Проверяем наличие ключа API
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Perplexity API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Объединяем параметры по умолчанию с переданными
    const mergedOptions = {
      model: "llama-3.1-sonar-small-128k-online",
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
  } catch (error: any) {
    console.error("Ошибка при вызове Perplexity AI:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling Perplexity API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}
