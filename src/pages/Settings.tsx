
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setSupabaseAIConfig, getSupabaseAIConfig } from "@/services/api/supabase/config";

const Settings = () => {
  const [supabaseConfig, setSupabaseConfig] = React.useState(getSupabaseAIConfig());

  const handleSupabaseBackendChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ useSupabaseBackend: checked });
    setSupabaseConfig(newConfig);
  };

  const handleFallbackChange = (checked: boolean) => {
    const newConfig = setSupabaseAIConfig({ fallbackToDirectCalls: checked });
    setSupabaseConfig(newConfig);
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
            </Tabs>
          </div>
          
          <PageFooter />
        </main>
      </div>
    </SearchProvider>
  );
};

export default Settings;
