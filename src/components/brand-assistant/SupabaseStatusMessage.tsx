
import React from "react";
import { Link } from "react-router-dom";
import { isOnSettingsPage } from '@/utils/navigation';

interface SupabaseStatusProps {
  connected: boolean;
  enabled: boolean;
  onRequestCheck?: () => void; // Функция для запроса проверки
}

export const SupabaseStatusMessage: React.FC<SupabaseStatusProps> = ({ 
  connected, 
  enabled,
  onRequestCheck 
}) => {
  // Используем централизованную функцию для проверки страницы настроек
  const inSettingsPage = isOnSettingsPage();
  
  // Если мы на странице настроек, вообще не отображаем компонент
  if (inSettingsPage) return null;
  
  // Если соединение установлено и бекенд включен, тоже ничего не отображаем
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
