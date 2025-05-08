
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle } from 'lucide-react';
import { PageHeader } from "@/components/PageHeader";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Key size={20} /> Настройки OpenAI API
            </CardTitle>
            <CardDescription>
              Информация о доступе к API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle size={18} />
                  <span className="font-medium">API ключ уже настроен</span>
                </div>
                <p className="text-sm text-green-600">
                  API ключ уже установлен в системе. Вам не нужно предоставлять свой собственный ключ для использования сервиса.
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                Этот сервис использует OpenAI API для поиска товаров. 
                Все запросы к API осуществляются с использованием общего ключа.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
