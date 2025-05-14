import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import {
  getApiKey as getApiKeyZylalabs,
  setApiKey as setApiKeyZylalabs,
  resetApiKey as resetApiKeyZylalabs,
  hasValidApiKey as hasValidApiKeyZylalabs
} from '@/services/api/zylalabsService';
import {
  getApiKey as getApiKeyOpenAI,
  setApiKey as setApiKeyOpenAI,
  resetApiKey as resetApiKeyOpenAI,
  hasValidApiKey as hasValidApiKeyOpenAI
} from '@/services/api/openai';
import {
  getApiKey as getApiKeyAbacus,
  setApiKey as setApiKeyAbacus,
  resetApiKey as resetApiKeyAbacus,
  hasValidApiKey as hasValidApiKeyAbacus,
  resetApiKey as resetApiKeyAbacus
} from '@/services/api/abacus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from '@radix-ui/react-icons';
import { useToast } from "@/components/ui/use-toast";

type ApiKeyFormProps = {
  keyType: 'zylalabs' | 'openai' | 'abacus';
};

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ keyType }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();
  
  const keyTitle = keyType === 'zylalabs'
    ? 'Zyla Labs'
    : keyType === 'openai'
      ? 'OpenAI'
      : keyType === 'abacus'
        ? 'Abacus.ai'
        : 'Неизвестный';
  
  const keyDescription = keyType === 'zylalabs'
    ? 'API ключ для доступа к Zyla Labs API'
    : keyType === 'openai'
      ? 'API ключ для доступа к OpenAI API'
      : keyType === 'abacus'
        ? 'API ключ для доступа к Abacus.ai API'
        : 'Неизвестный API ключ';
  
  useEffect(() => {
    refreshApiKey();
  }, [keyType]);
  
  useEffect(() => {
    setIsValid(
      (keyType === 'zylalabs' && hasValidApiKeyZylalabs()) ||
      (keyType === 'openai' && hasValidApiKeyOpenAI()) ||
      (keyType === 'abacus' && hasValidApiKeyAbacus())
    );
  }, [apiKey, keyType]);
  
  const refreshApiKey = () => {
    let storedKey = '';
    if (keyType === 'zylalabs') {
      storedKey = getApiKeyZylalabs();
    } else if (keyType === 'openai') {
      storedKey = getApiKeyOpenAI();
    } else if (keyType === 'abacus') {
      storedKey = getApiKeyAbacus();
    }
    setApiKey(storedKey);
  };
  
  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };
  
  const handleSaveKey = async () => {
    try {
      setIsSaving(true);
      
      if (keyType === 'zylalabs') {
        setApiKeyZylalabs(apiKey);
      } else if (keyType === 'openai') {
        setApiKeyOpenAI(apiKey);
      } else if (keyType === 'abacus') {
        setApiKeyAbacus(apiKey);
      } else {
        console.warn(`Неизвестный тип ключа: ${keyType}`);
        return;
      }
      
      setIsValid(true);
      setIsSaving(false);
      toast.success(`API ключ ${keyTitle} успешно сохранен`, { duration: 3000 });
    } catch (error) {
      console.error(`Ошибка при сохранении ключа ${keyType}:`, error);
      setIsSaving(false);
      toast.error(`Ошибка при сохранении ключа ${keyTitle}`, { duration: 3000 });
    }
  };

  const handleResetKey = async (): Promise<boolean> => {
    try {
      setIsResetting(true);
      
      let success = false;
      
      if (keyType === 'zylalabs') {
        success = resetApiKeyZylalabs();
      } else if (keyType === 'openai') {
        success = resetApiKeyOpenAI();
      } else if (keyType === 'abacus') {
        success = resetApiKeyAbacus();
      } else {
        console.warn(`Неизвестный тип ключа: ${keyType}`);
        return false;
      }
      
      if (success) {
        refreshApiKey();
        setIsResetting(false);
        toast.success(`API ключ ${keyTitle} успешно сброшен`, { duration: 3000 });
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
  
  const handleClearKey = async (): Promise<boolean> => {
    try {
      setIsResetting(true);
      
      let success = false;
      
      if (keyType === 'zylalabs') {
        success = resetApiKeyZylalabs();
      } else if (keyType === 'openai') {
        success = resetApiKeyOpenAI();
      } else if (keyType === 'abacus') {
        success = resetApiKeyAbacus();
      } else {
        console.warn(`Неизвестный тип ключа: ${keyType}`);
        return false;
      }
      
      if (success) {
        refreshApiKey();
        setApiKey('');
        setIsResetting(false);
        toast.success(`API ключ ${keyTitle} успешно удален`, { duration: 3000 });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{keyTitle} API Key</CardTitle>
        <CardDescription>{keyDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={handleKeyChange}
            placeholder={`Введите ваш ${keyTitle} API ключ`}
          />
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={handleSaveKey}
            disabled={isSaving || !apiKey}
            className="bg-green-500 text-white hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить ключ"
            )}
          </Button>
          <Button
            type="button"
            onClick={handleClearKey}
            disabled={isResetting}
            className="bg-red-500 text-white hover:bg-red-700"
          >
            {isResetting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Сброс...
              </>
            ) : (
              "Удалить ключ"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
