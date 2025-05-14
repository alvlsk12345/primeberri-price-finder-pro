
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, RefreshCw } from 'lucide-react';
import { getApiKey as getZylalabsApiKey, setApiKey as setZylalabsApiKey, resetApiKey as resetZylalabsApiKey, ZYLALABS_API_KEY } from '@/services/api/zylalabs/config';
import { getApiKey as getOpenAIApiKey, setApiKey as setOpenAIApiKey } from '@/services/api/openai/config';
import { getApiKey as getAbacusApiKey, setApiKey as setAbacusApiKey } from '@/services/api/abacus/config';

type ApiKeyProps = {
  keyType: 'openai' | 'zylalabs' | 'abacus';
};

export const ApiKeyForm: React.FC<ApiKeyProps> = ({ keyType }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Определяем параметры в зависимости от типа ключа
  const localStorageKey = 
    keyType === 'openai' ? 'openai_api_key' : 
    keyType === 'abacus' ? 'abacus_api_key' : 
    'zylalabs_api_key';
    
  const defaultKey = keyType === 'zylalabs' ? ZYLALABS_API_KEY : '';
  
  const keyTitle = 
    keyType === 'openai' ? 'OpenAI API' : 
    keyType === 'abacus' ? 'Abacus.ai API' : 
    'Zylalabs API';
    
  const keyPlaceholder = 
    keyType === 'openai' ? 'sk-...' : 
    keyType === 'abacus' ? 'abacus_api_key_...' : 
    '1234|...';
    
  const keyWebsite = 
    keyType === 'openai' ? 'https://platform.openai.com/api-keys' : 
    keyType === 'abacus' ? 'https://abacus.ai/app/apiKeys' : 
    'https://zylalabs.com/api/2033/real+time+product+search+api';

  useEffect(() => {
    // Проверяем наличие сохраненного ключа при инициализации
    try {
      if (keyType === 'zylalabs') {
        const key = getZylalabsApiKey();
        setApiKey(key);
      } else if (keyType === 'openai') {
        const key = getOpenAIApiKey();
        setApiKey(key);
      } else if (keyType === 'abacus') {
        const key = getAbacusApiKey();
        setApiKey(key);
      }
    } catch (error) {
      console.error(`Ошибка при получении ключа ${keyType}:`, error);
      setApiKey(keyType === 'zylalabs' ? ZYLALABS_API_KEY : '');
      toast.error(`Ошибка при загрузке ключа ${keyTitle}`, { duration: 3000 });
    }
  }, [keyType, keyTitle]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Пожалуйста, введите API ключ');
      return;
    }

    try {
      if (keyType === 'zylalabs') {
        const success = setZylalabsApiKey(apiKey.trim());
        if (success) {
          toast.success('API ключ Zylalabs успешно сохранен');
        } else {
          toast.error('Неверный формат API ключа Zylalabs');
        }
      } else if (keyType === 'openai') {
        setOpenAIApiKey(apiKey.trim());
        toast.success('API ключ OpenAI успешно сохранен');
      } else if (keyType === 'abacus') {
        setAbacusApiKey(apiKey.trim());
        toast.success('API ключ Abacus.ai успешно сохранен');
      }
    } catch (error) {
      console.error(`Ошибка при сохранении ключа ${keyType}:`, error);
      toast.error(`Ошибка при сохранении ключа ${keyTitle}`, { duration: 3000 });
    }
  };

  const handleResetKey = () => {
    try {
      if (keyType === 'zylalabs') {
        resetZylalabsApiKey();
        setApiKey(ZYLALABS_API_KEY);
        toast.success('API ключ Zylalabs сброшен на значение по умолчанию');
      }
    } catch (error) {
      console.error(`Ошибка при сбросе ключа ${keyType}:`, error);
      toast.error(`Ошибка при сбросе ключа ${keyTitle}`, { duration: 3000 });
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
            <Button onClick={handleSaveKey} className="flex-1">
              Сохранить ключ
            </Button>
            {keyType === 'zylalabs' && (
              <Button 
                onClick={handleResetKey} 
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
              {keyType === 'openai' ? 'OpenAI' : keyType === 'abacus' ? 'Abacus.ai' : 'Zylalabs'}
            </a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

