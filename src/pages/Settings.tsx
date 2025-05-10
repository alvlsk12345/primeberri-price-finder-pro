
import React, { useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { callOpenAI } from "@/services/api/openai/apiClient";
import { getApiKey } from "@/services/api/openai/config";
import { toast } from "sonner";
import { getCurrentProxyName, resetProxyIndex } from "@/services/image/corsProxyService";

const Settings = () => {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [proxyInfo, setProxyInfo] = useState<string>(getCurrentProxyName());

  // Функция для тестирования подключения к API OpenAI
  const testApiConnection = async () => {
    setApiStatus('testing');
    
    try {
      // Проверяем наличие API ключа
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.error("API ключ не установлен. Пожалуйста, добавьте свой ключ сначала.");
        setApiStatus('error');
        return;
      }
      
      // Выполняем простой запрос к API
      await callOpenAI("Скажи 'привет'", {
        max_tokens: 10,
        temperature: 0
      });
      
      // Если запрос успешен, обновляем статус
      setApiStatus('success');
      toast.success(`Проверка API успешна! Используемый прокси: ${getCurrentProxyName()}`);
      setProxyInfo(getCurrentProxyName());
    } catch (error: any) {
      console.error('Ошибка при тестировании API:', error);
      setApiStatus('error');
      
      if (error.message.includes("API ключ не установлен")) {
        toast.error("API ключ не указан. Пожалуйста, добавьте ключ в форме выше.");
      } else if (error.message.includes("Недействительный API ключ")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте ключ.");
      } else if (error.message.includes("Failed to fetch") || error.message.includes("Исчерпаны все попытки")) {
        toast.error("Не удалось подключиться к API. Возможные причины: проблемы с сетью или CORS ограничения.");
      } else {
        toast.error(`Ошибка при тестировании API: ${error.message}`);
      }
    }
  };

  // Функция для сброса настроек прокси
  const resetProxySettings = () => {
    resetProxyIndex();
    setProxyInfo(getCurrentProxyName());
    toast.info(`Прокси сброшен на ${getCurrentProxyName()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Настройки API</CardTitle>
            <CardDescription>
              Настройте API ключи для поиска товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zylalabs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zylalabs">Zylalabs API</TabsTrigger>
                <TabsTrigger value="openai">OpenAI API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zylalabs">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы поиска требуется действующий API ключ Zylalabs. Если у вас нет своего ключа, используется предустановленный ключ.
                    При ошибке 401 нажмите "Сбросить ключ".
                  </p>
                </div>
                <ApiKeyForm keyType="zylalabs" />
              </TabsContent>
              
              <TabsContent value="openai">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы поиска через AI требуется действующий API ключ OpenAI. Ваш ключ хранится только в вашем браузере и не передается третьим лицам. 
                    Если вы видите сообщение о превышении квоты, вам нужно проверить баланс вашего аккаунта OpenAI.
                  </p>
                </div>
                <ApiKeyForm keyType="openai" />
                
                <div className="mt-6 space-y-4">
                  <h3 className="text-base font-medium">Проверка подключения к API</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Статус API:</span>
                      <div className="flex items-center gap-2">
                        {apiStatus === 'idle' && <span className="text-gray-500">Не проверено</span>}
                        {apiStatus === 'testing' && <RefreshCw size={18} className="text-blue-500 animate-spin" />}
                        {apiStatus === 'success' && <CheckCircle size={18} className="text-green-500" />}
                        {apiStatus === 'error' && <XCircle size={18} className="text-red-500" />}
                        <span className={`text-sm ${
                          apiStatus === 'success' ? 'text-green-600' : 
                          apiStatus === 'error' ? 'text-red-600' : 
                          apiStatus === 'testing' ? 'text-blue-600' : 
                          'text-gray-600'
                        }`}>
                          {apiStatus === 'success' ? 'Работает' : 
                           apiStatus === 'error' ? 'Ошибка' :
                           apiStatus === 'testing' ? 'Проверка...' : 
                           'Не проверен'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Используемый CORS прокси:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{proxyInfo}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Button 
                        onClick={testApiConnection} 
                        disabled={apiStatus === 'testing'}
                        variant="default" 
                        className="flex-1"
                      >
                        {apiStatus === 'testing' ? (
                          <>
                            <RefreshCw size={16} className="mr-2 animate-spin" />
                            Проверка...
                          </>
                        ) : (
                          'Проверить API'
                        )}
                      </Button>
                      <Button 
                        onClick={resetProxySettings}
                        variant="outline"
                        className="flex-1"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Сбросить прокси
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
