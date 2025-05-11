
// Обработчик для запросов к OpenAI API
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
    console.error('OpenAI API key не настроен в Edge Function');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    console.log('Edge Function: обработка запроса к OpenAI с промптом длиной:', prompt.length);
    
    // Устанавливаем параметры запроса
    const {
      model = DEFAULT_OPENAI_OPTIONS.model,
      temperature = DEFAULT_OPENAI_OPTIONS.temperature,
      max_tokens = DEFAULT_OPENAI_OPTIONS.max_tokens,
      responseFormat = "text",
    } = options;
    
    console.log(`Edge Function: использую модель ${model}, temperature: ${temperature}, max_tokens: ${max_tokens}, format: ${responseFormat}`);
    
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
      console.log('Edge Function: запрашиваем ответ в формате JSON');
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
    
    if (!response.ok) {
      const data = await response.json();
      const errorMessage = data.error?.message || 'Unknown error from OpenAI';
      console.error('Edge Function: ошибка от API OpenAI:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Получаем ответ
    const data = await response.json();
    console.log('Edge Function: получен ответ от OpenAI API');
    
    // Получаем содержимое ответа
    const content = data.choices[0]?.message?.content;
    console.log('Edge Function: содержимое ответа (первые 100 символов):', 
      content ? content.substring(0, 100) + '...' : 'Пусто');
    
    // Обрабатываем ответ в зависимости от формата
    if (responseFormat === "json_object") {
      try {
        // Если запрошен JSON, пытаемся распарсить ответ
        let parsedJson;
        try {
          parsedJson = JSON.parse(content);
        } catch (jsonError) {
          console.warn('Edge Function: не удалось распарсить JSON напрямую, пробуем очистить контент');
          
          // Пытаемся удалить markdown обрамление, если оно есть
          let cleanContent = content.trim()
            .replace(/^```json\s*/g, '')
            .replace(/\s*```$/g, '');
            
          parsedJson = JSON.parse(cleanContent);
        }
        
        console.log('Edge Function: JSON успешно распарсен');
        
        // ВАЖНОЕ ИЗМЕНЕНИЕ: Возвращаем распарсенный JSON напрямую, без обертки в result
        return new Response(
          JSON.stringify(parsedJson),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      } catch (e) {
        console.warn('Edge Function: ошибка при парсинге JSON ответа:', e);
        console.warn('Edge Function: возвращаем оригинальный текст');
        
        // В случае ошибки парсинга возвращаем оригинальный текст без обертки в result
        return new Response(
          content,
          { headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS } }
        );
      }
    }
    
    // Для текстового формата просто возвращаем содержимое без обертки в result
    return new Response(
      content,
      { headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('Edge Function: ошибка при обработке запроса к OpenAI:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling OpenAI API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}
