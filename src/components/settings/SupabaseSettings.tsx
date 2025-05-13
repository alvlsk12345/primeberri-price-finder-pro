
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Database } from "lucide-react";

type SupabaseSettingsProps = {
  supabaseStatus: 'checking' | 'connected' | 'disconnected';
  supabaseConnected: boolean;
  useSupabaseBE: boolean;
  useFallback: boolean;
  handleSupabaseBackendChange: (checked: boolean) => void;
  handleFallbackChange: (checked: boolean) => void;
};

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({
  supabaseStatus,
  supabaseConnected,
  useSupabaseBE,
  useFallback,
  handleSupabaseBackendChange,
  handleFallbackChange
}) => {
  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Настройки Supabase</CardTitle>
        <CardDescription>
          Настройка интеграции с Supabase для AI поиска
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Database size={18} />
            <span className="font-medium">Интеграция с Supabase</span>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Интеграция с Supabase позволяет безопасно использовать API ключи и предотвращать проблемы с CORS. 
            Edge Function обрабатывает вызовы к API, делая взаимодействие более стабильным.
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Статус подключения:</span>
            <div className="flex items-center gap-2">
              {supabaseStatus === 'checking' && <RefreshCw size={18} className="text-blue-500 animate-spin" />}
              {supabaseStatus === 'connected' && <CheckCircle size={18} className="text-green-500" />}
              {supabaseStatus === 'disconnected' && <XCircle size={18} className="text-red-500" />}
              <span className={`text-sm ${
                supabaseStatus === 'connected' ? 'text-green-600' : 
                supabaseStatus === 'disconnected' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {supabaseStatus === 'connected' ? 'Подключено' : 
                 supabaseStatus === 'disconnected' ? 'Не подключено' : 
                 'Проверка...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="useSupabaseBackend" className="text-sm font-medium">Использовать Supabase Backend</Label>
              <p className="text-xs text-gray-500 mt-1">
                API вызовы будут проходить через Edge Functions
              </p>
            </div>
            <Switch
              id="useSupabaseBackend"
              checked={useSupabaseBE}
              onCheckedChange={handleSupabaseBackendChange}
              disabled={!supabaseConnected && supabaseStatus !== 'checking'}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="useFallback" className="text-sm font-medium">Фоллбэк на прямые вызовы</Label>
              <p className="text-xs text-gray-500 mt-1">
                Использовать прямые API вызовы при ошибке Supabase
              </p>
            </div>
            <Switch
              id="useFallback"
              checked={useFallback}
              onCheckedChange={handleFallbackChange}
              disabled={!useSupabaseBE}
            />
          </div>
          
          {!supabaseConnected && supabaseStatus !== 'checking' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <p className="flex items-center gap-1 font-medium mb-1">
                <AlertCircle size={16} />
                Supabase не подключен
              </p>
              <p>
                Чтобы использовать Supabase Backend, подключите проект к Supabase, используя зеленую кнопку в верхней части интерфейса,
                и создайте Edge Function 'ai-proxy'.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
