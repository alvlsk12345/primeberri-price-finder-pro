
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS обработка для preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Получаем текущего пользователя из запроса
    const authHeader = req.headers.get('Authorization')
    let token = ''
    
    if (authHeader) {
      token = authHeader.replace('Bearer ', '')
    }

    // Получаем параметры запроса
    const { action, key, value } = await req.json()

    if (!action || !key) {
      throw new Error('Отсутствуют обязательные параметры: action и key')
    }

    // Выполняем действие в зависимости от запрошенной операции
    if (action === 'get') {
      // Получаем значение из метаданных
      const { data, error } = await supabaseClient
        .from('user_metadata')
        .select('value')
        .eq('key', key)
        .maybeSingle()

      if (error) {
        console.error('Ошибка при получении значения из БД:', error)
        throw new Error('Не удалось получить значение из БД')
      }

      return new Response(
        JSON.stringify({ success: true, value: data?.value || null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (action === 'set') {
      if (!value) {
        throw new Error('Отсутствует обязательный параметр: value')
      }

      // Сохраняем значение в метаданных
      const { error } = await supabaseClient.from('user_metadata').upsert(
        { key, value },
        { onConflict: 'key' }
      )

      if (error) {
        console.error('Ошибка при сохранении значения в БД:', error)
        throw new Error('Не удалось сохранить значение в БД')
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
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
        status: 400,
      }
    )
  }
})
