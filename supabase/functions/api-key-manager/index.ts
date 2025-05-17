
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

    // Локальное хранилище ключей как временное решение
    const keyStorage: Record<string, string> = {}
    
    // Получаем секрет из Supabase, если он доступен
    let storedSecret = null;
    if (key === 'zylalabs-api-key') {
      storedSecret = Deno.env.get('ZYLALABS_API_KEY');
      console.log('Проверка наличия секрета ZYLALABS_API_KEY в Edge Functions:', !!storedSecret);
    }
    
    // Выполняем действие в зависимости от запрошенной операции
    if (action === 'get') {
      try {
        // Приоритет у секрета из Supabase, если он доступен
        if (storedSecret) {
          console.log('Используем секрет из Supabase Edge Functions');
          return new Response(
            JSON.stringify({ success: true, value: storedSecret, source: 'supabase' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        
        // Иначе пытаемся найти в локальном хранилище
        return new Response(
          JSON.stringify({ success: true, value: keyStorage[key] || null, source: 'local' }),
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
        // Если ключ предназначен для Zylalabs, выводим сообщение о настройке в Supabase
        if (key === 'zylalabs-api-key') {
          console.log('Примечание: API ключ Zylalabs также доступен через секрет Supabase');
        }
        
        // Сохраняем в локальном хранилище (на случай, если секрет Supabase не настроен)
        keyStorage[key] = value
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: key === 'zylalabs-api-key' ? 
              'API ключ сохранен локально. Для лучшей безопасности рекомендуется настроить секрет ZYLALABS_API_KEY в Supabase Edge Functions.' : 
              'Значение успешно сохранено'
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
