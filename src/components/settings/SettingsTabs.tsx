
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysTabContent } from "@/components/settings/ApiKeysTabContent";
import { SupabaseTabContent } from "@/components/settings/SupabaseTabContent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

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
          <React.Suspense fallback={<LoadingApiKeysTab />}>
            <ApiKeysTabContent />
          </React.Suspense>
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
          <React.Suspense fallback={<LoadingSupabaseTab />}>
            <SupabaseTabContent />
          </React.Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
};

// Компоненты для отображения состояния загрузки
const LoadingApiKeysTab: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
  </div>
);

const LoadingSupabaseTab: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);
