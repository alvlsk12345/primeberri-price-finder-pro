
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { SupabaseSettings } from "@/components/settings/SupabaseSettings";
import { AiProviderSettings } from "@/components/settings/AiProviderSettings";
import { ApiSettings } from "@/components/settings/ApiSettings";
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import { useApiConnection } from "@/hooks/useApiConnection";
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  // Получаем данные о состоянии Supabase
  const supabaseConnection = useSupabaseConnection();
  
  // Получаем данные о состоянии API
  const apiConnection = useApiConnection();
  
  // Проверяем нужно ли показать предупреждение о Supabase
  const showWarning = supabaseConnection.useSupabaseBE && !supabaseConnection.supabaseConnected;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        {showWarning && (
          <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Внимание: Проблема с настройками Supabase
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="mb-2">
                Supabase Backend включен, но соединение не установлено.
                Для корректной работы с OpenAI API необходимо настроить Supabase Backend.
              </p>
              <Link 
                to="#supabase-settings" 
                className="inline-block mt-2 px-4 py-2 bg-white border border-amber-300 rounded-md text-amber-700 hover:bg-amber-50"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('supabase-settings')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Перейти к настройкам
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div id="supabase-settings">
          <SupabaseSettings 
            {...supabaseConnection}
          />
        </div>

        <AiProviderSettings 
          selectedProvider={apiConnection.selectedProvider}
          handleProviderChange={apiConnection.handleProviderChange}
        />
        
        <ApiSettings 
          selectedProvider={apiConnection.selectedProvider}
          apiStatus={apiConnection.apiStatus}
          proxyInfo={apiConnection.proxyInfo}
          useSupabaseBE={supabaseConnection.useSupabaseBE}
          supabaseConnected={supabaseConnection.supabaseConnected}
          apiInfo={{}}
          testApiConnection={apiConnection.testApiConnection}
        />
      </main>
    </div>
  );
};

export default Settings;
