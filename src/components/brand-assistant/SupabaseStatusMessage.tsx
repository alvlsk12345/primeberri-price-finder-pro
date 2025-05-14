
import React from "react";
import { Link } from "react-router-dom";
import { isOnSettingsPage, getRouteInfo } from '@/utils/navigation';

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
  console.log(`[SupabaseStatusMessage] Рендер с параметрами: connected=${connected}, enabled=${enabled}`);
  
  // Используем централизованную функцию для проверки страницы настроек
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[SupabaseStatusMessage] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);
  
  // Если мы на странице настроек, вообще не отображаем компонент
  if (inSettingsPage) {
    console.log('[SupabaseStatusMessage] На странице настроек, возвращаем null');
    return null;
  }
  
  // Если соединение установлено и бекенд включен, тоже ничего не отображаем
  if (connected && enabled) {
    console.log('[SupabaseStatusMessage] Соединение установлено и бекенд включен, возвращаем null');
    return null;
  }
  
  console.log('[SupabaseStatusMessage] Отображаем сообщение о состоянии подключения');
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
