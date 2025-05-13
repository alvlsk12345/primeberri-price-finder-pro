
// Клиентская библиотека для взаимодействия с Supabase

import { createClient } from '@supabase/supabase-js'
import { getSupabaseAIConfig } from './config';
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const dataPath = document.body.getAttribute('data-path');
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings") ||
         dataPath === '/settings';
};

// Проверка соединения с Supabase Edge Functions
export const isSupabaseConnected = async (forceCheck = false): Promise<boolean> => {
  // Проверяем, находимся ли мы на странице настроек
  // и если да, то пропускаем проверку, если не требуется принудительная проверка
  if (isOnSettingsPage() && !forceCheck) {
    // Не выполняем проверку на странице настроек, если это не запрошено явно
    return true; // Предполагаем, что соединение установлено на странице настроек
  }

  try {
    // Проверка соединения с Edge Function через endpoint ai-proxy
    const { data, error } = await supabaseIntegration.functions.invoke('ai-proxy', {
      body: { action: 'check_connection' }
    });

    // Если есть ошибка или ответ не содержит status: 'ok'
    if (error || !data || data.status !== 'ok') {
      return false;
    }

    return true;
  } catch (error) {
    // В случае ошибки считаем, что соединение не установлено
    return false;
  }
};

// Экспортируем созданного клиента Supabase для использования в приложении
export const supabase = supabaseIntegration;
