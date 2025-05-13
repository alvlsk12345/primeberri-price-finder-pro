
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/30 to-brand/10">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <SearchProvider>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Настройки</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg mb-4">Страница настроек в стадии разработки.</p>
              <p>Здесь будут располагаться настройки приложения.</p>
            </div>
          </div>
        </SearchProvider>
        
        <PageFooter />
      </main>
    </div>
  );
};

export default Settings;
