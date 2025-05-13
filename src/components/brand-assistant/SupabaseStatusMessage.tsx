
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
  if (connected && enabled) return null;
  
  return (
    <div className={`p-3 ${!connected ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"} rounded-md mt-3`}>
      <p className={`text-sm ${!connected ? "text-amber-700" : "text-blue-700"}`}>
        {!enabled && connected ? (
          <>
            Рекомендуется включить опцию "Использовать Supabase Backend" в настройках для обхода ограничений CORS.
            <Link to="/settings" className="ml-1 underline font-medium">Перейти к настройкам</Link>
          </>
        ) : (
          <>
            Для работы AI-помощника необходимо настроить подключение к Supabase или указать API ключ OpenAI в настройках.
            <Link to="/settings" className="ml-1 underline font-medium">Перейти к настройкам</Link>
          </>
        )}
      </p>
    </div>
  );
};
