
import React, { useState } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { SearchProvider } from "@/contexts/SearchContext";
import { getSelectedAIProvider, setSelectedAIProvider, AIProvider } from "@/services/api/aiProviderService";
import { toast } from "sonner";
import { SupabaseSettings } from "@/components/settings/SupabaseSettings";
import { AiProviderSettings } from "@/components/settings/AiProviderSettings";
import { ApiSettings } from "@/components/settings/ApiSettings";
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import { useApiConnection } from "@/hooks/useApiConnection";

// Создаем обертку для компонента Settings
const SettingsContent: React.FC = () => {
  // Состояние для выбранного AI провайдера
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getSelectedAIProvider());
  
  // Используем хук для Supabase
  const supabaseConnection = useSupabaseConnection();
  
  // Используем хук для API
  const apiConnection = useApiConnection();
  
  // Имитация apiInfo для компонента без необходимости useSearch
  const apiInfo = {} as Record<string, string>;

  // Функция для обработки изменения провайдера
  const handleProviderChange = (value: AIProvider) => {
    setSelectedProvider(value);
    setSelectedAIProvider(value);
    toast.success(`AI провайдер изменен на ${value.toUpperCase()}`);
    apiConnection.setApiStatus('idle'); // Сбрасываем статус API при смене провайдера
  };
  
  // Функция для тестирования API
  const testApiConnection = () => {
    apiConnection.testApiConnection(
      selectedProvider, 
      supabaseConnection.useSupabaseBE, 
      supabaseConnection.supabaseConnected
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <SupabaseSettings 
          {...supabaseConnection}
        />

        <AiProviderSettings 
          selectedProvider={selectedProvider}
          handleProviderChange={handleProviderChange}
        />
        
        <ApiSettings 
          selectedProvider={selectedProvider}
          apiStatus={apiConnection.apiStatus}
          proxyInfo={apiConnection.proxyInfo}
          useSupabaseBE={supabaseConnection.useSupabaseBE}
          supabaseConnected={supabaseConnection.supabaseConnected}
          apiInfo={apiInfo}
          testApiConnection={testApiConnection}
        />
      </main>
    </div>
  );
};

// Обертка компонента в SearchProvider
const Settings = () => {
  return (
    <SearchProvider>
      <SettingsContent />
    </SearchProvider>
  );
};

export default Settings;
