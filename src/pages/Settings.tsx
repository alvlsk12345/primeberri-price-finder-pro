
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Настройки API</CardTitle>
            <CardDescription>
              Настройте API ключи для поиска товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zylalabs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zylalabs">Zylalabs API</TabsTrigger>
                <TabsTrigger value="openai">OpenAI API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zylalabs">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы поиска требуется действующий API ключ Zylalabs. Если у вас нет своего ключа, используется предустановленный ключ.
                    При ошибке 401 нажмите "Сбросить ключ".
                  </p>
                </div>
                <ApiKeyForm keyType="zylalabs" />
              </TabsContent>
              
              <TabsContent value="openai">
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
                <ApiKeyForm keyType="openai" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
