
// Основной файл с Edge Function кодом и руководством по установке

// ПРИМЕЧАНИЕ: Этот файл содержит код Edge Function, 
// который нужно добавить в панели управления Supabase после подключения

/*
// ai-proxy Edge Function для вызова внешних AI API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleOpenAIRequest } from './handlers/openai.ts';
import { handleAbacusRequest } from './handlers/abacus.ts';
import { CORS_HEADERS } from './config.ts';

// Для безопасного хранения ключей API
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ABACUS_API_KEY = Deno.env.get('ABACUS_API_KEY');

// Обработчик запросов
serve(async (req) => {
  try {
    // CORS preflight обработка
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        headers: CORS_HEADERS 
      });
    }
    
    // Получаем параметры запроса
    const { provider, ...params } = await req.json();
    
    // Проверяем наличие провайдера
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
      );
    }
    
    // В зависимости от провайдера вызываем соответствующую функцию
    if (provider === 'openai') {
      return await handleOpenAIRequest(params, OPENAI_API_KEY);
    } else if (provider === 'abacus') {
      return await handleAbacusRequest(params, ABACUS_API_KEY);
    }
    
    // Если провайдер не поддерживается, возвращаем ошибку
    return new Response(
      JSON.stringify({ error: `Unsupported provider: ${provider}` }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 400 }
    );
  } catch (error) {
    // Обработка ошибок
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }, status: 500 }
    );
  }
});
*/

// Руководство по настройке Edge Function
export { EDGE_FUNCTION_CONFIG } from './config';

// Экспортируем всё необходимое для справки
export const AI_PROXY_EDGE_FUNCTION_GUIDE = {
  functionName: 'ai-proxy',
  requiredSecrets: ['OPENAI_API_KEY', 'ABACUS_API_KEY'],
  supabaseDocsUrl: 'https://supabase.com/docs/guides/functions',
  deploymentSteps: [
    'В панели управления Supabase перейдите в раздел "Edge Functions"',
    'Создайте новую функцию с названием "ai-proxy"',
    'Скопируйте код выше в редактор функции',
    'Добавьте секреты OPENAI_API_KEY и ABACUS_API_KEY в разделе "Секреты"',
    'Разверните функцию'
  ],
  // Шаги тестирования
  testSteps: [
    'После развертывания, вы можете протестировать функцию через Supabase Dashboard',
    'Проверьте работу с OpenAI, отправив запрос с провайдером "openai"',
    'Проверьте работу с Abacus, отправив запрос с провайдером "abacus"'
  ]
};
