
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Настройки API</CardTitle>
            <CardDescription>
              Для поиска товаров необходим ваш личный ключ OpenAI API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle size={18} />
                <span className="font-medium">Важная информация</span>
              </div>
              <p className="text-sm text-amber-700">
                Для работы поиска требуется действующий API ключ OpenAI. Ваш ключ хранится только в вашем браузере и не передается третьим лицам. 
                Если вы видите сообщение о превышении квоты, вам нужно проверить баланс вашего аккаунта OpenAI.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <ApiKeyForm />
      </main>
    </div>
  );
};

export default Settings;
