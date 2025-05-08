
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Key } from 'lucide-react';

export const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем наличие сохраненного ключа при инициализации
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Пожалуйста, введите API ключ');
      return;
    }

    localStorage.setItem('openai_api_key', apiKey.trim());
    toast.success('API ключ успешно сохранен');
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card className="max-w-md mx-auto mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key size={18} /> Настройки OpenAI API
        </CardTitle>
        <CardDescription>
          Введите ваш API ключ OpenAI для поиска товаров
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
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
          <Button onClick={handleSaveKey} className="w-full">
            Сохранить ключ
          </Button>
          <p className="text-xs text-gray-500">
            Ключ будет сохранен только в вашем браузере и не передается никаким третьим лицам.
            Получить ключ можно на сайте <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">OpenAI</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
