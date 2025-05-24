
import React from "react";
import { Link } from "react-router-dom";

interface SupabaseStatusProps {
  connected: boolean;
  enabled: boolean;
}

export const SupabaseStatusMessage: React.FC<SupabaseStatusProps> = ({ 
  connected, 
  enabled 
}) => {
  // ИСПРАВЛЕНИЕ: не показываем сообщение если проблем нет
  if (connected && enabled) return null;
  
  // ИСПРАВЛЕНИЕ: не показываем на главной странице если нет реальных проблем
  const currentPath = window.location.pathname;
  if (currentPath === '/' && connected) return null;
  
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
          </>
        )}
      </p>
    </div>
  );
};
