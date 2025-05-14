
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, RefreshCw, Trash2 } from 'lucide-react';
import { getApiKey as getZylalabsApiKey, setApiKey as setZylalabsApiKey, resetApiKey as resetZylalabsApiKey } from '@/services/api/zylalabs/config';
import { getApiKey as getOpenAIApiKey, setApiKey as setOpenAIApiKey, resetApiKey as resetOpenAIApiKey } from '@/services/api/openai/config';
import { getApiKey as getAbacusApiKey, setApiKey as setAbacusApiKey, resetApiKey as resetAbacusApiKey } from '@/services/api/abacus/config';

type ApiKeyProps = {
  keyType: 'openai' | 'zylalabs' | 'abacus';
};

export const ApiKeyForm: React.FC<ApiKeyProps> = ({ keyType }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Определяем параметры в зависимости от типа ключа
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

  // Загружаем сохраненный ключ
  const loadApiKey = () => {
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
      
      console.log(`Загружен API ключ ${keyType}:`, key ? `${key.substring(0, 4)}...` : 'пустой');
      setApiKey(key);
      setIsLoading(false);
    } catch (error) {
      console.error(`Ошибка при получении ключа ${keyType}:`, error);
      setApiKey('');
      setIsLoading(false);
      toast.error(`Ошибка при загрузке ключа ${keyTitle}`, { duration: 3000 });
    }
  };

  useEffect(() => {
    // Проверяем наличие сохраненного ключа при инициализации
    loadApiKey();
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
      setIsResetting(true);
      let success = false;
      
      if (keyType === 'zylalabs') {
        success = resetZylalabsApiKey();
      } else if (keyType === 'openai') {
        success = resetOpenAIApiKey();
      } else if (keyType === 'abacus') {
        success = resetAbacusApiKey();
      }
      
      if (success) {
        // Сбрасываем локальное состояние поля ввода
        setApiKey('');
        
        // Принудительно загружаем ключ снова после небольшой задержки
        setTimeout(() => {
          loadApiKey();
          setIsResetting(false);
          toast.success(`API ключ ${keyTitle} успешно сброшен`);
        }, 300);
      } else {
        setIsResetting(false);
        toast.error(`Не удалось сбросить API ключ ${keyTitle}`);
      }
      
      return success;
    } catch (error) {
      console.error(`Ошибка при сбросе ключа ${keyType}:`, error);
      setIsResetting(false);
      toast.error(`Ошибка при сбросе ключа ${keyTitle}`, { duration: 3000 });
      return false;
    }
  };

  const handleClearKey = () => {
    try {
      setIsResetting(true);
      let success = false;
      
      if (keyType === 'zylalabs') {
        success = resetZylalabsApiKey();
      } else if (keyType === 'openai') {
        success = resetOpenAIApiKey();
      } else if (keyType === 'abacus') {
        success = resetAbacusApiKey();
      }
      
      if (success) {
        // Очищаем поле ввода
        setApiKey('');
        
        // Принудительно перезагружаем данные
        setTimeout(() => {
          loadApiKey();
          setIsResetting(false);
          toast.success(`API ключ ${keyTitle} успешно удален`);
        }, 300);
      } else {
        setIsResetting(false);
        toast.error(`Не удалось удалить API ключ ${keyTitle}`);
      }
      
      return success;
    } catch (error) {
      console.error(`Ошибка при очистке ключа ${keyType}:`, error);
      setIsResetting(false);
      toast.error(`Ошибка при очистке ключа ${keyTitle}`, { duration: 3000 });
      return false;
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
            <Key size={18} /> Загрузка настроек {keyTitle}...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
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
            <Button 
              onClick={handleClearKey} 
              variant="destructive" 
              className="flex items-center gap-1"
              disabled={isResetting}
            >
              <Trash2 size={16} /> 
              {isResetting ? "Удаление..." : "Удалить ключ"}
            </Button>
            {keyType === 'zylalabs' && (
              <Button 
                onClick={handleResetKey} 
                variant="outline" 
                className="flex items-center gap-1"
                disabled={isResetting}
              >
                <RefreshCw size={16} className={isResetting ? "animate-spin" : ""} /> 
                {isResetting ? "Сброс..." : "Сбросить ключ"}
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
