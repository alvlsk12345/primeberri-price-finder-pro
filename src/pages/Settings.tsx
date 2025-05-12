import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Bot, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { callOpenAI } from "@/services/api/openai/apiClient";
import { getApiKey as getOpenAIApiKey } from "@/services/api/openai/config";
import { callAbacusAI } from "@/services/api/abacus/apiClient";
import { getApiKey as getAbacusApiKey } from "@/services/api/abacus/config";
import { toast } from "sonner";
import { getSelectedAIProvider, setSelectedAIProvider, AIProvider } from "@/services/api/aiProviderService";
import { 
  isSupabaseConnected, 
  checkSupabaseConnection 
} from "@/services/api/supabase/client";
import { 
  isUsingSupabaseBackend, 
  isFallbackEnabled,
  getSupabaseAIConfig, 
  setSupabaseAIConfig 
} from "@/services/api/supabase/config";
import { callAIViaSupabase } from "@/services/api/supabase/aiService";
import { AI_PROXY_EDGE_FUNCTION_GUIDE } from "@/services/api/supabase/edgeFunctionCode";
import { DiagnosticButtons } from "@/components/search/DiagnosticButtons";

const Settings = () => {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [proxyInfo, setProxyInfo] = useState<string>("Прямое соединение (без прокси)");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getSelectedAIProvider());
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [useSupabaseBE, setUseSupabaseBE] = useState<boolean>(isUsingSupabaseBackend());
  const [useFallback, setUseFallback] = useState<boolean>(isFallbackEnabled());

  // Проверяем подключение к Supabase при загрузке
  useEffect(() => {
    async function checkConnection() {
      setSupabaseStatus('checking');
      try {
        const connected = await checkSupabaseConnection();
        setSupabaseConnected(connected);
        setSupabaseStatus(connected ? 'connected' : 'disconnected');
        if (connected) {
          toast.success('Соединение с Supabase установлено', { duration: 3000 });
        }
      } catch (error) {
        console.error('Ошибка при проверке подключения к Supabase:', error);
        setSupabaseConnected(false);
        setSupabaseStatus('disconnected');
      }
    }
    
    checkConnection();
  }, []);
  
  // Получаем настройки Supabase AI
  useEffect(() => {
    const config = getSupabaseAIConfig();
    setUseSupabaseBE(config.useSupabaseBackend);
    setUseFallback(config.fallbackToDirectCalls);
  }, []);

  // Функция для тестирования подключения к API
  const testApiConnection = async () => {
    setApiStatus('testing');
    
    try {
      if (useSupabaseBE && supabaseConnected) {
        // Проверяем работу через Supabase
        await callAIViaSupabase({
          provider: selectedProvider === 'openai' ? 'openai' : 'abacus',
          prompt: selectedProvider === 'openai' ? "Скажи 'привет'" : undefined,
          endpoint: selectedProvider === 'abacus' ? 'testConnection' : undefined,
          method: 'GET'
        });
        
        setApiStatus('success');
        toast.success(`Проверка API ${selectedProvider.toUpperCase()} через Supabase успешна!`);
        return;
      }
      
      // Если Supabase не используется или недоступен, проверяем прямое соединение
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
        await callAbacusAI('testConnection', 'GET');
      }
      
      // Если запрос успешен, обновляем статус
      setApiStatus('success');
      setProxyInfo('Прямое соединение');
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
  
  // Функция для изменения режима работы с Supabase
  const handleSupabaseBackendChange = (checked: boolean) => {
    setUseSupabaseBE(checked);
    setSupabaseAIConfig({ useSupabaseBackend: checked });
    
    if (checked && !supabaseConnected) {
      toast.warning('Supabase не подключен. Проверьте настройки подключения или используйте прямое соединение.', 
                   { duration: 5000 });
    } else if (checked) {
      toast.success('Режим Supabase Backend активирован', { duration: 3000 });
    } else {
      toast.info('Используется прямое соединение с API', { duration: 3000 });
    }
  };
  
  // Функция для изменения режима фоллбэка
  const handleFallbackChange = (checked: boolean) => {
    setUseFallback(checked);
    setSupabaseAIConfig({ fallbackToDirectCalls: checked });
    
    if (checked) {
      toast.success('Фоллбэк на прямые вызовы API активирован', { duration: 3000 });
    } else {
      toast.info('Фоллбэк на прямые вызовы API отключен', { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
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
              Настройте API ключи для поиска товаров и диагностика API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mb-6">
              <h3 className="text-base font-medium mb-3">Диагностика API</h3>
              <p className="text-sm text-gray-600 mb-3">
                Используйте эти кнопки для проверки работоспособности различных API, 
                необходимых для работы приложения. Результаты будут показаны во всплывающих 
                уведомлениях.
              </p>
              <DiagnosticButtons />
            </div>
            
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
                    Для работы поиска через AI требуется действующий API ключ OpenAI. 
                    {useSupabaseBE ? ' При использовании Supabase ключ должен быть добавлен в секреты Supabase Edge Function.' : 
                      ' Ваш ключ хранится только в вашем браузере и не передается третьим лицам.'}
                    {!useSupabaseBE && ' Если вы видите сообщение о превышении квоты, вам нужно проверить баланс вашего аккаунта OpenAI.'}
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
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {useSupabaseBE && supabaseConnected ? 'Supabase Backend' : proxyInfo}
                      </span>
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
                    Для работы поиска через Abacus.ai требуется действующий API ключ. 
                    {useSupabaseBE ? ' При использовании Supabase ключ должен быть добавлен в секреты Supabase Edge Function.' : 
                      ' Ваш ключ хранится только в вашем браузере и не передается третьим лицам.'}
                    {' '}Получите ключ в панели управления Abacus.ai.
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
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {useSupabaseBE && supabaseConnected ? 'Supabase Backend' : proxyInfo}
                      </span>
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
