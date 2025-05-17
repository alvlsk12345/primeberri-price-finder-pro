
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";
import { ApiKeyInput } from './ApiKeyInput';
import { ApiKeyStatus } from './ApiKeyStatus';
import { DemoModeAlert } from './DemoModeAlert';
import { 
  ApiKeyType, 
  getApiKey, 
  setApiKey, 
  API_SERVICE_NAMES, 
  API_KEY_URLS,
  getTestApiUrl,
  getApiHeaders
} from "@/services/api/apiKeyService";
import { useDemoModeForced } from "@/services/api/mock/mockServiceConfig";

// Интерфейс для пропсов ApiKeyForm
interface ApiKeyFormProps {
  keyType: ApiKeyType;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ keyType }) => {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [storedApiKey, setStoredApiKey] = useState<string>("");
  const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(false);
  
  // Получаем значение напрямую
  const isDemoMode = useDemoModeForced;
  const serviceName = API_SERVICE_NAMES[keyType];

  // Загрузка сохраненного API ключа при монтировании компонента
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedKey = await getApiKey(keyType);
        if (savedKey) {
          setStoredApiKey(savedKey);
          setIsSaved(true);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке API ключа ${keyType}:`, error);
      }
    };
    
    loadApiKey();
  }, [keyType]);

  // Обработчик сохранения API ключа
  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.length < 20) {
      toast.error(`Пожалуйста, введите действительный API ключ ${serviceName} (минимум 20 символов)`);
      return;
    }

    try {
      await setApiKey(keyType, apiKey);
      setStoredApiKey(apiKey);
      setIsSaved(true);
      setApiKeyState(""); // Очищаем поле ввода после сохранения
      
      // Очищаем кеш после смены API ключа если это Zylalabs
      if (keyType === 'zylalabs') {
        clearApiCache();
      }
      
      toast.success(`API ключ ${serviceName} успешно сохранен`);
    } catch (error) {
      console.error(`Ошибка при сохранении API ключа ${keyType}:`, error);
      toast.error(`Не удалось сохранить API ключ ${serviceName}`);
    }
  };

  // Обработчик копирования ключа в буфер обмена
  const handleCopy = () => {
    if (storedApiKey) {
      navigator.clipboard.writeText(storedApiKey);
      setHasCopied(true);
      toast.success(`API ключ ${serviceName} скопирован в буфер обмена`);
      
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  };
  
  // Проверка API ключа
  const checkApiKey = async () => {
    setIsCheckingApiKey(true);
    try {
      // Проверяем API ключ
      const savedKey = await getApiKey(keyType);
      
      if (!savedKey) {
        toast.error(`API ключ ${serviceName} не найден`);
        setIsCheckingApiKey(false);
        return;
      }
      
      // Получаем тестовый URL для данного типа API
      const testUrl = getTestApiUrl(keyType);
      
      // Показываем уведомление о начале проверки
      toast.loading(`Проверка API ключа ${serviceName}...`, { id: "api-check", duration: 5000 });
      
      // Очищаем кеш перед проверкой если это Zylalabs
      if (keyType === 'zylalabs') {
        clearApiCache();
      }
      
      try {
        const headers = getApiHeaders(keyType, savedKey);
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: headers
        });
        
        // Закрываем уведомление о проверке
        toast.dismiss("api-check");
        
        if (response.ok) {
          toast.success(`API ключ ${serviceName} действителен и работает корректно`);
        } else {
          const errorText = await response.text();
          console.error(`Ошибка при проверке API ключа ${keyType}:`, response.status, errorText);
          toast.error(`Ошибка проверки API ключа ${serviceName}: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        toast.dismiss("api-check");
        console.error(`Ошибка сети при проверке API ключа ${keyType}:`, error);
        toast.error(`Ошибка сети при проверке API ключа ${serviceName}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error(`Ошибка при проверке API ключа ${keyType}:`, error);
      toast.error(`Не удалось проверить API ключ ${serviceName} из-за внутренней ошибки`);
    } finally {
      setIsCheckingApiKey(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="h-5 w-5 text-blue-600" />
        <Label htmlFor={`api-key-${keyType}`} className="text-lg font-medium">
          API ключ {serviceName}
        </Label>
      </div>
      
      <DemoModeAlert isDemoMode={isDemoMode} />
      
      <ApiKeyInput 
        apiKey={apiKey}
        onApiKeyChange={setApiKeyState}
        onSave={handleSaveApiKey}
        keyType={keyType}
      />
      
      {isSaved && storedApiKey && (
        <ApiKeyStatus 
          storedApiKey={storedApiKey}
          isCheckingApiKey={isCheckingApiKey}
          onCopy={handleCopy}
          checkApiKey={checkApiKey}
          hasCopied={hasCopied}
        />
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Для получения API ключа перейдите на сайт <a href={API_KEY_URLS[keyType]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{serviceName}</a></p>
      </div>
    </div>
  );
};
