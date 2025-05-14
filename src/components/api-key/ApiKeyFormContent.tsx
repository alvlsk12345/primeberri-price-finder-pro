
import React from 'react';
import { Key, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKey } from './ApiKeyContext';

export const ApiKeyFormContent: React.FC = () => {
  const { 
    apiKey, 
    setApiKey, 
    isVisible, 
    toggleVisibility, 
    saveKey, 
    resetKey,
    keyTitle,
    keyPlaceholder,
    keyWebsite
  } = useApiKey();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key size={18} /> Настройки {keyTitle}
        </CardTitle>
        <CardDescription>
          Введите ваш {keyTitle} ключ для поиска товаров
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={keyPlaceholder}
              className="pr-16"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8"
              onClick={toggleVisibility}
            >
              {isVisible ? "Скрыть" : "Показать"}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={saveKey} className="flex-1">
              Сохранить ключ
            </Button>
            {resetKey && (
              <Button 
                onClick={() => {
                  if (resetKey) {
                    const defaultKey = resetKey();
                    if (defaultKey) {
                      setApiKey(defaultKey);
                    }
                  }
                }} 
                variant="outline" 
                className="flex items-center gap-1"
              >
                <RefreshCw size={16} /> Сбросить ключ
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Ключ будет сохранен только в вашем браузере и не передается никаким третьим лицам.
            Получить ключ можно на сайте <a href={keyWebsite} target="_blank" rel="noreferrer" className="underline">
              {keyTitle === 'OpenAI API' ? 'OpenAI' : keyTitle === 'Abacus.ai API' ? 'Abacus.ai' : 'Zylalabs'}
            </a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
