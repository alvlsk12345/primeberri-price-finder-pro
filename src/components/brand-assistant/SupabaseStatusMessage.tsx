
import React from "react";
import { Link } from "react-router-dom";

interface SupabaseStatusProps {
  connected: boolean;
  enabled: boolean;
  onRequestCheck?: () => void; // Добавляем опциональную функцию для запроса проверки
}

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings");
};

export const SupabaseStatusMessage: React.FC<SupabaseStatusProps> = ({ 
  connected, 
  enabled,
  onRequestCheck 
}) => {
  // Если мы на странице настроек, вообще не отображаем компонент
  if (isOnSettingsPage()) return null;
  
  // Если соединение установлено и бекенд включен, тоже ничего не отображаем
  if (connected && enabled) return null;
  
  return (
    <div className={`p-3 ${!connected ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"} rounded-md mt-3`}>
      <p className={`text-sm ${!connected ? "text-amber-700" : "text-blue-700"}`}>
        {!enabled && connected ? (
          <>
            Рекомендуется включить опцию "Использовать Supabase Backend" в настройках для обхода ограничений CORS.
            <a href="/settings" className="ml-1 underline font-medium">Перейти к настройкам</a>
          </>
        ) : (
          <>
            Для работы AI-помощника необходимо настроить подключение к Supabase или указать API ключ OpenAI в настройках.
            <a href="/settings" className="ml-1 underline font-medium">Перейти к настройкам</a>
            {onRequestCheck && (
              <button 
                onClick={onRequestCheck}
                className="ml-2 text-xs underline font-medium"
              >
                Проверить соединение сейчас
              </button>
            )}
          </>
        )}
      </p>
    </div>
  );
};
