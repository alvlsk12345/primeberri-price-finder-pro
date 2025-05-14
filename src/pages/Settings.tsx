
import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setSupabaseAIConfig, getSupabaseAIConfig } from "@/services/api/supabase/config";
import { checkSupabaseConnection, clearConnectionCache } from "@/services/api/supabase/client";
import { RefreshCw, Check, X } from "lucide-react";
import { getRouteInfo } from '@/utils/navigation';

// Отключаем SearchProvider на странице настроек, чтобы избежать автоматических проверок
const Settings = () => {
  console.log('[Settings] Рендер компонента Settings');
  
  // Устанавливаем атрибут data-path в body при монтировании компонента
  // Делаем это до любых других операций
  useEffect(() => {
    console.log('[Settings] useEffect - устанавливаем data-path /settings');
    document.body.setAttribute('data-path', '/settings');
    document.body.classList.add('settings-page');
    
    // Используем setTimeout, чтобы дать время на установку атрибута
    // перед очисткой кеша соединения
    const timeoutId = setTimeout(() => {
      console.log('[Settings] Отложенная очистка кеша состояния подключения');
      clearConnectionCache();
    }, 100);
    
    return () => {
      console.log('[Settings] useEffect - удаляем data-path при размонтировании');
      document.body.removeAttribute('data-path');
      document.body.classList.remove('settings-page');
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Безопасно получаем конфигурацию
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    console.log('[Settings] Инициализация состояния supabaseConfig');
    try {
      return getSupabaseAIConfig();
    } catch (error) {
      console.error('[Settings] Ошибка при получении конфигурации:', error);
      return {
        useSupabaseBackend: true,
        fallbackToDirectCalls: true
      };
    }
  });
  
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<null | boolean>(null);

  // Дополнительный эффект для проверки и логирования текущего маршрута
  useEffect(() => {
    const routeInfo = getRouteInfo();
    console.log(`[Settings] Текущий маршрут после монтирования: ${JSON.stringify(routeInfo)}`);
    
    // Дополнительная защита от перенаправления - проверяем раз в секунду
    const intervalId = setInterval(() => {
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        console.warn(`[Settings] Обнаружен некорректный маршрут: ${JSON.stringify(currentRouteInfo)}`);
        // Восстанавливаем правильный атрибут
        document.body.setAttribute('data-path', '/settings');
        document.body.classList.add('settings-page');
      }
    }, 1000);
    
    // Очистка интервала при размонтировании
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleSupabaseBackendChange = (checked: boolean) => {
    try {
      const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
      setSupabaseConfig(newConfig);
    } catch (error) {
      console.error('[Settings] Ошибка при изменении настройки useSupabaseBackend:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };

  const handleFallbackChange = (checked: boolean) => {
    try {
      const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
      setSupabaseConfig(newConfig);
    } catch (error) {
      console.error('[Settings] Ошибка при изменении настройки fallbackToDirectCalls:', error);
      toast.error('Не удалось сохранить настройки, попробуйте еще раз');
    }
  };

  // Функция для проверки соединения с Supabase - ТОЛЬКО ПО НАЖАТИЮ КНОПКИ
  const handleCheckConnection = async () => {
    // Проверяем, что это действительно страница настроек
    const routeInfo = getRouteInfo();
    if (!routeInfo.isSettings) {
      console.warn('[Settings] handleCheckConnection: отменено, так как это не страница настроек');
      return;
    }
    
    setCheckingStatus(true);
    setConnectionStatus(null);
    
    try {
      toast.loading("Проверка соединения с Supabase...", {
        id: 'check-connection-toast'
      });
      
      // Очищаем кеш состояния подключения перед проверкой
      clearConnectionCache();
      
      // Явное требование проверки соединения с принудительным обновлением кеша
      const isConnected = await checkSupabaseConnection(true);
      
      // Повторно проверяем, что мы все еще на странице настроек
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        console.warn('[Settings] handleCheckConnection: отменено обновление UI, так как маршрут изменился');
        toast.dismiss('check-connection-toast');
        return;
      }
      
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        toast.success("Соединение с Supabase успешно установлено", {
          description: "Edge Functions доступны для использования",
          duration: 5000
        });
      } else {
        toast.error("Не удалось установить соединение с Supabase", {
          description: "Проверьте настройки и доступность Supabase Edge Functions",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("[Settings] Ошибка при проверке соединения:", error);
      
      // Повторно проверяем маршрут
      const currentRouteInfo = getRouteInfo();
      if (!currentRouteInfo.isSettings) {
        toast.dismiss('check-connection-toast');
        return;
      }
      
      setConnectionStatus(false);
      toast.error("Произошла ошибка при проверке соединения", {
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        duration: 5000
      });
    } finally {
      // Проверяем маршрут перед обновлением состояния
      const finalRouteInfo = getRouteInfo();
      if (finalRouteInfo.isSettings) {
        setCheckingStatus(false);
      }
      toast.dismiss('check-connection-toast');
    }
  };

  // Проверяем текущий маршрут перед рендерингом
  const routeInfo = getRouteInfo();
  console.log(`[Settings] Перед рендерингом, текущий маршрут: ${JSON.stringify(routeInfo)}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10 settings-page">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Настройки</h1>
          
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="api-keys">API ключи</TabsTrigger>
              <TabsTrigger value="supabase">Настройки Supabase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-keys" className="space-y-4">
              <div className="grid gap-6">
                <ApiKeyForm keyType="zylalabs" />
                <ApiKeyForm keyType="openai" />
                <ApiKeyForm keyType="abacus" />
              </div>
            </TabsContent>
            
            <TabsContent value="supabase">
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
                    <div className="flex items-center">
                      {connectionStatus !== null && (
                        <div 
                          className={`mr-2 flex items-center px-3 py-1 rounded text-xs font-medium ${
                            connectionStatus 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {connectionStatus ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Подключено
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Не подключено
                            </>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCheckConnection}
                        disabled={checkingStatus}
                        className="text-xs flex items-center"
                      >
                        {checkingStatus ? (
                          <>
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Проверка...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Проверить соединение
                          </>
                        )}
                      </Button>
                    </div>
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
            </TabsContent>
          </Tabs>
        </div>
        
        <PageFooter />
      </main>
    </div>
  );
};

export default Settings;
