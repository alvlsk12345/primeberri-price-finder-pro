
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConnectionStatus } from "@/components/settings/ConnectionStatus";
import { useSupabaseConnection } from "@/hooks/settings/useSupabaseConnection";
import { useSupabaseConfig } from "@/hooks/settings/useSupabaseConfig";

export const SupabaseTabContent: React.FC = () => {
  console.log('[SupabaseTabContent] Начало рендера компонента SupabaseTabContent');
  
  try {
    const { checkingStatus, connectionStatus, handleCheckConnection } = useSupabaseConnection();
    console.log('[SupabaseTabContent] useSupabaseConnection загружен успешно');
    
    const { supabaseConfig, handleSupabaseBackendChange, handleFallbackChange } = useSupabaseConfig();
    console.log('[SupabaseTabContent] useSupabaseConfig загружен успешно');

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Настройки Supabase Edge Functions</CardTitle>
              <CardDescription>
                Настройте использование Supabase Edge Functions для API запросов
              </CardDescription>
            </div>
            
            {/* Статус соединения */}
            <ConnectionStatus 
              connectionStatus={connectionStatus}
              checkingStatus={checkingStatus}
              onCheckConnection={handleCheckConnection}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="use-supabase" className="flex flex-col space-y-1">
              <span>Использовать Supabase Backend</span>
              <span className="font-normal text-sm text-muted-foreground">
                Использовать Supabase Edge Functions для обхода ограничений CORS
              </span>
            </Label>
            <Switch 
              id="use-supabase"
              checked={supabaseConfig.useSupabaseBackend}
              onCheckedChange={handleSupabaseBackendChange}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="fallback" className="flex flex-col space-y-1">
              <span>Резервное подключение</span>
              <span className="font-normal text-sm text-muted-foreground">
                Использовать прямые вызовы API при недоступности Supabase
              </span>
            </Label>
            <Switch 
              id="fallback"
              checked={supabaseConfig.fallbackToDirectCalls}
              onCheckedChange={handleFallbackChange}
            />
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('[SupabaseTabContent] Ошибка при рендеринге компонента:', error);
    
    // Возвращаем упрощенную версию компонента при ошибке
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройки Supabase Edge Functions</CardTitle>
          <CardDescription className="text-red-500">
            Произошла ошибка при загрузке настроек. Пожалуйста, обновите страницу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </pre>
        </CardContent>
      </Card>
    );
  }
};
