
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS обработка для preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Создаем Supabase клиент с env переменными
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        auth: { persistSession: false }
      }
    )

    // Получаем параметры запроса
    const { action, key, value } = await req.json()

    if (!action || !key) {
      throw new Error('Отсутствуют обязательные параметры: action и key')
    }

    // Определяем ключи API для поддержки
    const supportedKeys = {
      'zylalabs-api-key': 'ZYLALABS_API_KEY',
      'openai_api_key': 'OPENAI_API_KEY',
      'perplexity_api_key': 'PERPLEXITY_API_KEY'
    };
    
    // Выполняем действие в зависимости от запрошенной операции
    if (action === 'get') {
      try {
        // Проверяем, поддерживается ли данный ключ
        const envVarName = supportedKeys[key];
        if (envVarName) {
          // Пытаемся получить ключ из Supabase секретов
          const storedSecret = Deno.env.get(envVarName);
          if (storedSecret) {
            console.log(`Использование секрета ${envVarName} из Supabase Edge Functions`);
            return new Response(
              JSON.stringify({ success: true, value: storedSecret, source: 'supabase' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            )
          }
        }
        
        // Если секрет не найден в Supabase, возвращаем null
        return new Response(
          JSON.stringify({ success: true, value: null, source: 'none' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        console.error('Ошибка при получении значения:', error)
        
        return new Response(
          JSON.stringify({ success: false, value: null, error: 'Не удалось получить значение' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Используем 200 вместо ошибки для корректной обработки на клиенте
          }
        )
      }
    } else if (action === 'set') {
      if (!value) {
        throw new Error('Отсутствует обязательный параметр: value')
      }

      try {
        // Определяем, какой ключ API установлен
        const envVarName = supportedKeys[key];
        let message = 'Значение успешно сохранено локально';
        
        if (envVarName) {
          message = `API ключ сохранен локально. Для лучшей безопасности рекомендуется настроить секрет ${envVarName} в Supabase Edge Functions.`;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (error) {
        console.error('Ошибка при сохранении значения:', error)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Не удалось сохранить значение',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Используем 200 вместо ошибки для корректной обработки на клиенте
          }
        )
      }
    } else {
      throw new Error('Неизвестное действие: ' + action)
    }
  } catch (error) {
    console.error('Ошибка в Edge Function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Используем 200 для лучшей обработки на клиенте
      }
    )
  }
})
