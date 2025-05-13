
import React, { useState } from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
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
import { checkSupabaseConnection } from "@/services/api/supabase/client";
import { RefreshCw, Check, X } from "lucide-react";

const Settings = () => {
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseAIConfig());
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<null | boolean>(null);

  const handleSupabaseBackendChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
    setSupabaseConfig(newConfig);
  };

  const handleFallbackChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
    setSupabaseConfig(newConfig);
  };

  // Функция для проверки соединения с Supabase
  const handleCheckConnection = async () => {
    setCheckingStatus(true);
    setConnectionStatus(null);
    
    try {
      toast.loading("Проверка соединения с Supabase...");
      const isConnected = await checkSupabaseConnection();
      
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
      console.error("Ошибка при проверке соединения:", error);
      setConnectionStatus(false);
      toast.error("Произошла ошибка при проверке соединения", {
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        duration: 5000
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10">
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
    </SearchProvider>
  );
};

export default Settings;
