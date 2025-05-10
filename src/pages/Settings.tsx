
import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIProvider, getCurrentAIProvider, setCurrentAIProvider } from '@/services/productFormatter';
import { RadioGroup, RadioGroupItem } from "@/components/ui/form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Settings = () => {
  const form = useForm<{ aiProvider: AIProvider }>({
    defaultValues: {
      aiProvider: getCurrentAIProvider()
    }
  });

  const handleProviderChange = (provider: AIProvider) => {
    setCurrentAIProvider(provider);
    toast.success(`AI провайдер изменен на ${provider === 'openai' ? 'OpenAI' : 'Abacus'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <main className="container mx-auto py-10 px-4 space-y-6">
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Выбор AI провайдера</CardTitle>
            <CardDescription>
              Выберите, какой AI сервис использовать для поиска и рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="aiProvider"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProviderChange(value as AIProvider);
                          }}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="openai" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              OpenAI (GPT-4)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="abacus" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Abacus AI
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Настройки API</CardTitle>
            <CardDescription>
              Настройте API ключи для поиска товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zylalabs">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zylalabs">Zylalabs API</TabsTrigger>
                <TabsTrigger value="openai">OpenAI API</TabsTrigger>
                <TabsTrigger value="abacus">Abacus API</TabsTrigger>
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
              
              <TabsContent value="abacus">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Для работы с Abacus AI требуется действующий API ключ. Вы можете получить его на сайте Abacus.AI. 
                    Ваш ключ хранится только в вашем браузере и не передается третьим лицам.
                  </p>
                </div>
                <ApiKeyForm keyType="abacus" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
