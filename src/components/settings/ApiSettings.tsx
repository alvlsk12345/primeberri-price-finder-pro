
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { DiagnosticButtons } from "@/components/search/DiagnosticButtons";
import { ApiUsageInfo } from "@/components/search/ApiUsageInfo";
import { AIProvider } from "@/services/api/aiProviderService";

type ApiSettingsProps = {
  selectedProvider: AIProvider;
  apiStatus: 'idle' | 'testing' | 'success' | 'error';
  proxyInfo: string;
  useSupabaseBE: boolean;
  supabaseConnected: boolean;
  apiInfo?: Record<string, string>;
  testApiConnection: () => void;
};

export const ApiSettings: React.FC<ApiSettingsProps> = ({
  selectedProvider,
  apiStatus,
  proxyInfo,
  useSupabaseBE,
  supabaseConnected,
  apiInfo,
  testApiConnection
}) => {
  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Настройки API</CardTitle>
        <CardDescription>
          Настройте API ключи для поиска товаров и диагностика API
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Блок для статистики использования API */}
        <div className="mb-4">
          <h3 className="text-base font-medium mb-3">Статистика использования API</h3>
          {apiInfo && Object.keys(apiInfo).length > 0 ? (
            <ApiUsageInfo />
          ) : (
            <p className="text-sm text-gray-500">Информация будет доступна после выполнения поисковых запросов</p>
          )}
        </div>
        
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="zylalabs">Zylalabs API</TabsTrigger>
            <TabsTrigger value="openai">OpenAI API</TabsTrigger>
            <TabsTrigger value="abacus">Abacus.ai API</TabsTrigger>
            <TabsTrigger value="perplexity">Perplexity API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="zylalabs">
            <ApiKeyForm keyType="zylalabs" />
          </TabsContent>
          
          <TabsContent value="openai">
            <ApiKeyForm keyType="openai" />
            <ApiConnectionTester
              apiStatus={apiStatus}
              proxyInfo={proxyInfo}
              useSupabaseBE={useSupabaseBE}
              supabaseConnected={supabaseConnected}
              testApiConnection={testApiConnection}
            />
          </TabsContent>
          
          <TabsContent value="abacus">
            <ApiKeyForm keyType="abacus" />
            <ApiConnectionTester
              apiStatus={apiStatus}
              proxyInfo={proxyInfo}
              useSupabaseBE={useSupabaseBE}
              supabaseConnected={supabaseConnected}
              testApiConnection={testApiConnection}
            />
          </TabsContent>
          
          <TabsContent value="perplexity">
            <ApiKeyForm keyType="perplexity" />
            <ApiConnectionTester
              apiStatus={apiStatus}
              proxyInfo={proxyInfo}
              useSupabaseBE={useSupabaseBE}
              supabaseConnected={supabaseConnected}
              testApiConnection={testApiConnection}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Подкомпонент для тестирования подключения к API
const ApiConnectionTester: React.FC<{
  apiStatus: 'idle' | 'testing' | 'success' | 'error';
  proxyInfo: string;
  useSupabaseBE: boolean;
  supabaseConnected: boolean;
  testApiConnection: () => void;
}> = ({ apiStatus, proxyInfo, useSupabaseBE, supabaseConnected, testApiConnection }) => {
  return (
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
  );
};
