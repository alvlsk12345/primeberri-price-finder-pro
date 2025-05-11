
import React, { useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { callOpenAI } from "@/services/api/openai/apiClient";
import { getApiKey as getOpenAIApiKey } from "@/services/api/openai/config";
import { callAbacusAI } from "@/services/api/abacus/apiClient";
import { getApiKey as getAbacusApiKey } from "@/services/api/abacus/config";
import { toast } from "sonner";
import { getSelectedAIProvider, setSelectedAIProvider, AIProvider } from "@/services/api/aiProviderService";

const Settings = () => {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [proxyInfo] = useState<string>("Прямое соединение (без прокси)");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getSelectedAIProvider());

  // Функция для тестирования подключения к API
  const testApiConnection = async () => {
    setApiStatus('testing');
    
    try {
      if (selectedProvider === 'openai') {
        // Проверяем наличие API ключа OpenAI
        const apiKey = getOpenAIApiKey();
        if (!apiKey) {
          toast.error("API ключ OpenAI не установлен. Пожалуйста, добавьте свой ключ сначала.");
          setApiStatus('error');
          return;
        }
        
        // Выполняем простой запрос к API OpenAI
        await callOpenAI("Скажи 'привет'", {
          max_tokens: 10,
          temperature: 0
        });
      } else if (selectedProvider === 'abacus') {
        // Проверяем наличие API ключа Abacus
        const apiKey = getAbacusApiKey();
        if (!apiKey) {
          toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ сначала.");
          setApiStatus('error');
          return;
        }
        
        // Выполняем простой запрос к API Abacus (для теста)
        // Примечание: нужно заменить на реальный метод API Abacus
        await callAbacusAI('testConnection', 'GET');
      }
      
      // Если запрос успешен, обновляем статус
      setApiStatus('success');
      toast.success(`Проверка API ${selectedProvider.toUpperCase()} успешна! Режим соединения: прямой`);
    } catch (error: any) {
      console.error(`Ошибка при тестировании API ${selectedProvider}:`, error);
      setApiStatus('error');
      
      if (error.message.includes("API ключ не установлен")) {
        toast.error(`API ключ ${selectedProvider} не указан. Пожалуйста, добавьте ключ в форме выше.`);
      } else if (error.message.includes("Недействительный API ключ")) {
        toast.error(`Недействительный API ключ ${selectedProvider}. Пожалуйста, проверьте ключ.`);
      } else if (error.message.includes("Failed to fetch") || error.message.includes("Исчерпаны все попытки")) {
        toast.error("Не удалось подключиться к API. Возможные причины: проблемы с сетью или CORS ограничения.");
      } else {
        toast.error(`Ошибка при тестировании API: ${error.message}`);
      }
    }
  };

  // Функция для обработки изменения провайдера
  const handleProviderChange = (value: AIProvider) => {
    setSelectedProvider(value);
    setSelectedAIProvider(value);
    toast.success(`AI провайдер изменен на ${value.toUpperCase()}`);
    setApiStatus('idle'); // Сбрасываем статус API при смене провайдера
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Выбор AI провайдера</CardTitle>
            <CardDescription>
              Выберите предпочитаемый AI провайдер для поиска брендов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle size={18} />
                <span className="font-medium">Важная информация</span>
              </div>
              <p className="text-sm text-amber-700">
                Выбранный AI провайдер будет использоваться для поиска брендов и товаров.
                Для каждого провайдера требуется свой API ключ, который вы можете настроить ниже.
              </p>
            </div>
            <RadioGroup 
              value={selectedProvider} 
              onValueChange={(value) => handleProviderChange(value as AIProvider)}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="flex items-center gap-2 cursor-pointer">
                  <Bot size={18} className="text-green-600" />
                  <span>OpenAI (GPT-4o)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="abacus" id="abacus" />
                <Label htmlFor="abacus" className="flex items-center gap-2 cursor-pointer">
                  <Bot size={18} className="text-blue-600" />
                  <span>Abacus.ai</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Настройки API</CardTitle>
            <CardDescription>
              Настройте API ключи для поиска товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zylalabs">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zylalabs">Zylalabs API</TabsTrigger>
                <TabsTrigger value="openai">OpenAI API</TabsTrigger>
                <TabsTrigger value="abacus">Abacus.ai API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zylalabs">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы поиска требуется действующий API ключ Zylalabs. Если у вас нет своего ключа, используется предустановленный ключ.
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
                      <span className="text-sm">Режим соединения:</span>
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
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="abacus">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы поиска через Abacus.ai требуется действующий API ключ. Ваш ключ хранится только 
                    в вашем браузере и не передается третьим лицам. Получите ключ в панели управления Abacus.ai.
                  </p>
                </div>
                <ApiKeyForm keyType="abacus" />
                
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
                      <span className="text-sm">Режим соединения:</span>
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
