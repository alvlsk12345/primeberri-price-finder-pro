
// Обработчик для запросов к Abacus AI

/**
 * Обрабатывает запросы к Abacus API через Edge Function
 * @param params Параметры запроса (endpoint, метод, данные)
 * @param ABACUS_API_KEY API ключ Abacus
 * @returns Promise с объектом Response
 */
export async function handleAbacusRequest({ 
  endpoint, 
  method = 'POST', 
  requestData = {} 
}: {
  endpoint: string;
  method?: 'GET' | 'POST';
  requestData?: Record<string, any>;
}, ABACUS_API_KEY: string) {
  // Импортируем CORS заголовки и дефолтные опции
  import { CORS_HEADERS, ABACUS_API_BASE_URL } from '../config';
  
  // Проверяем наличие ключа API
  if (!ABACUS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Abacus API key not configured' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
  
  try {
    // Формируем полный URL эндпоинта
    let fullUrl = `${ABACUS_API_BASE_URL}/${endpoint}`;
    
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
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (error) {
    console.error('Abacus API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calling Abacus API' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
}
