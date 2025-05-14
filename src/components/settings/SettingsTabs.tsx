
import React, { Suspense } from 'react';
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
        <ErrorBoundary fallback={
          <div className="p-4 bg-red-50 rounded-md text-red-600">
            <h3 className="font-medium mb-2">Произошла ошибка при загрузке вкладки API ключей</h3>
            <p>Причиной может быть проблема с доступом к локальному хранилищу (localStorage).</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        }>
          <Suspense fallback={<div className="animate-pulse p-4">Загрузка настроек API...</div>}>
            <ApiKeysTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
      
      <TabsContent value="supabase">
        <ErrorBoundary fallback={
          <div className="p-4 bg-red-50 rounded-md text-red-600">
            <h3 className="font-medium mb-2">Произошла ошибка при загрузке настроек Supabase</h3>
            <p>Причиной может быть проблема с доступом к локальному хранилищу (localStorage).</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        }>
          <Suspense fallback={<div className="animate-pulse p-4">Загрузка настроек Supabase...</div>}>
            <SupabaseTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
};
