
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysTab } from "@/components/settings/tabs/ApiKeysTab";
import { SupabaseTab } from "@/components/settings/tabs/SupabaseTab";

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="api-keys" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="api-keys">API ключи</TabsTrigger>
        <TabsTrigger value="supabase">Настройки Supabase</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api-keys" className="space-y-4">
        <ApiKeysTab />
      </TabsContent>
      
      <TabsContent value="supabase">
        <SupabaseTab />
      </TabsContent>
    </Tabs>
  );
};
