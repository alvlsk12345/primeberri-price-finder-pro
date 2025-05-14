
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysTab } from "@/components/settings/tabs/ApiKeysTab";
import { SupabaseTab } from "@/components/settings/tabs/SupabaseTab";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="api-keys" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="api-keys">API ключи</TabsTrigger>
        <TabsTrigger value="supabase">Настройки Supabase</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api-keys" className="space-y-4">
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-md text-red-600">
          Произошла ошибка при загрузке вкладки API ключей. Пожалуйста, обновите страницу.
        </div>}>
          <ApiKeysTab />
        </ErrorBoundary>
      </TabsContent>
      
      <TabsContent value="supabase">
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 rounded-md text-red-600">
          Произошла ошибка при загрузке вкладки настроек Supabase. Пожалуйста, обновите страницу.
        </div>}>
          <SupabaseTab />
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
};
