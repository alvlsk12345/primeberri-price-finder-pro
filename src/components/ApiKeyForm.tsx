
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, RefreshCw } from 'lucide-react';
import ErrorBoundary from "@/components/ErrorBoundary";

// Импортируем функции для работы с API ключами
import { getApiKey as getZylalabsApiKey, setApiKey as setZylalabsApiKey, resetApiKey as resetZylalabsApiKey, ZYLALABS_API_KEY } from '@/services/api/zylalabs/config';
import { getApiKey as getOpenAIApiKey, setApiKey as setOpenAIApiKey } from '@/services/api/openai/config';
import { getApiKey as getAbacusApiKey, setApiKey as setAbacusApiKey } from '@/services/api/abacus/config';

type ApiKeyProps = {
  keyType: 'openai' | 'zylalabs' | 'abacus';
};

export const ApiKeyForm: React.FC<ApiKeyProps> = ({ keyType }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
    // Проверяем наличие сохраненного ключа при инициализации с задержкой для стабильности
    const timeoutId = setTimeout(() => {
      try {
        setIsLoading(true);
        let key = '';
        
        if (keyType === 'zylalabs') {
          key = getZylalabsApiKey();
        } else if (keyType === 'openai') {
          key = getOpenAIApiKey();
        } else if (keyType === 'abacus') {
          key = getAbacusApiKey();
        }
        
        setApiKey(key);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error(`[ApiKeyForm] Ошибка при получении ${keyType} ключа:`, err);
        setError(`Не удалось получить ${keyTitle} ключ. Проверьте консоль для деталей.`);
        setIsLoading(false);
      }
    }, 300); // Задержка для стабильности
    
    return () => clearTimeout(timeoutId);
  }, [keyType, keyTitle]);

  const handleSaveKey = () => {
    try {
      if (!apiKey.trim()) {
        toast.error('Пожалуйста, введите API ключ');
        return;
      }

      if (keyType === 'zylalabs') {
        const success = setZylalabsApiKey(apiKey.trim());
        if (success) {
          toast.success('API ключ Zylalabs успешно сохранен');
          setError(null);
        } else {
          toast.error('Неверный формат API ключа Zylalabs');
        }
      } else if (keyType === 'openai') {
        setOpenAIApiKey(apiKey.trim());
        toast.success('API ключ OpenAI успешно сохранен');
        setError(null);
      } else if (keyType === 'abacus') {
        setAbacusApiKey(apiKey.trim());
        toast.success('API ключ Abacus.ai успешно сохранен');
        setError(null);
      }
    } catch (err) {
      console.error(`[ApiKeyForm] Ошибка при сохранении ${keyType} ключа:`, err);
      toast.error(`Ошибка при сохранении ключа ${keyTitle}. Попробуйте еще раз.`);
    }
  };

  const handleResetKey = () => {
    try {
      if (keyType === 'zylalabs') {
        resetZylalabsApiKey();
        setApiKey(ZYLALABS_API_KEY);
        toast.success('API ключ Zylalabs сброшен на значение по умолчанию');
        setError(null);
      }
    } catch (err) {
      console.error(`[ApiKeyForm] Ошибка при сбросе ${keyType} ключа:`, err);
      toast.error(`Ошибка при сбросе ключа ${keyTitle}. Попробуйте еще раз.`);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key size={18} /> Настройки {keyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key size={18} /> Настройки {keyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-md text-red-600">
            {error}
            <Button 
              onClick={() => setError(null)} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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

// Оборачиваем компонент в ErrorBoundary для дополнительной защиты от ошибок
export const SafeApiKeyForm: React.FC<ApiKeyProps> = (props) => {
  return (
    <ErrorBoundary fallback={
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key size={18} /> Настройки {
              props.keyType === 'openai' ? 'OpenAI API' : 
              props.keyType === 'abacus' ? 'Abacus.ai API' : 
              'Zylalabs API'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-md text-red-600">
            <h3 className="font-medium mb-2">Ошибка при загрузке настроек API ключа</h3>
            <p>Возможно, проблема с доступом к локальному хранилищу (localStorage).</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    }>
      <ApiKeyForm {...props} />
    </ErrorBoundary>
  );
};
