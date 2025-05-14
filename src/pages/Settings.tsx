
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setSupabaseAIConfig, getSupabaseAIConfig } from "@/services/api/supabase/config";
import { getSelectedAIProvider, setSelectedAIProvider, AIProvider } from '@/services/api/aiProviderService';
import { toast } from "sonner";
import { Settings2 } from 'lucide-react';

const Settings = () => {
  const [supabaseConfig, setSupabaseConfig] = React.useState(getSupabaseAIConfig());
  const [aiProvider, setAiProvider] = React.useState<AIProvider>(getSelectedAIProvider());

  const handleSupabaseBackendChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
    setSupabaseConfig(newConfig);
  };

  const handleFallbackChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
    setSupabaseConfig(newConfig);
  };

  const handleAIProviderChange = (value: AIProvider) => {
    setSelectedAIProvider(value);
    setAiProvider(value);
    toast.success(`AI провайдер изменен на ${value === 'openai' ? 'OpenAI' : 'Abacus.ai'}`, { duration: 2000 });
  };

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10">
        <PageHeader />
        
        <main className="container mx-auto py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Настройки</h1>
            
            <Tabs defaultValue="api-keys" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="api-keys">API ключи</TabsTrigger>
                <TabsTrigger value="supabase">Настройки Supabase</TabsTrigger>
                <TabsTrigger value="ai-provider">AI Провайдер</TabsTrigger>
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
                    <CardTitle>Настройки Supabase Edge Functions</CardTitle>
                    <CardDescription>
                      Настройте использование Supabase Edge Functions для API запросов
                    </CardDescription>
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
              
              <TabsContent value="ai-provider">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      <CardTitle>Выбор AI провайдера</CardTitle>
                    </div>
                    <CardDescription>
                      Выберите AI модель для обработки запросов и поиска товаров
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-2 w-full">
                      <div className="w-full">
                        <Label htmlFor="ai-provider-select" className="mb-2 block">
                          AI Провайдер
                        </Label>
                        <Select value={aiProvider} onValueChange={handleAIProviderChange}>
                          <SelectTrigger id="ai-provider-select" className="w-full">
                            <SelectValue placeholder="Выберите AI провайдер" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI (GPT-4o-search-preview)</SelectItem>
                            <SelectItem value="abacus">Abacus.ai (Text Generation Model)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2">
                          OpenAI обеспечивает высокую точность результатов поиска, но имеет ограничения на количество запросов.
                          Abacus.ai предлагает альтернативный подход с другими возможностями.
                        </p>
                      </div>
                    </div>
                    
                    <div className="border border-dashed border-gray-300 p-4 rounded-md">
                      <h3 className="text-sm font-medium">Текущий провайдер: {aiProvider === 'openai' ? 'OpenAI' : 'Abacus.ai'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {aiProvider === 'openai' 
                          ? 'Используется модель GPT-4o-search-preview для поиска товаров и брендов' 
                          : 'Используется Text Generation Model от Abacus.ai для поиска товаров и брендов'}
                      </p>
                      <p className="text-sm mt-1 text-amber-600">
                        Не забудьте добавить API ключ для выбранного провайдера во вкладке "API ключи"
                      </p>
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
