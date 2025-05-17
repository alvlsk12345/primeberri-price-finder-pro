
import React, { useState, useEffect } from 'react';
import { setApiKey, getApiKey } from "@/services/api/zylalabs";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useDemoModeForced } from "@/services/api/mock/mockServiceConfig";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";
import { BASE_URL } from "@/services/api/zylalabs/config";
import { ApiKeyInput } from './ApiKeyInput';
import { ApiKeyStatus } from './ApiKeyStatus';
import { DemoModeAlert } from './DemoModeAlert';

// Интерфейс для пропсов ApiKeyForm
interface ApiKeyFormProps {
  keyType?: string;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ keyType = "zylalabs" }) => {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [storedApiKey, setStoredApiKey] = useState<string>("");
  const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(false);
  
  // Исправлено: получаем значение напрямую, а не через вызов функции
  const isDemoMode = useDemoModeForced;

  // Загрузка сохраненного API ключа при монтировании компонента
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedKey = await getApiKey();
        if (savedKey) {
          setStoredApiKey(savedKey);
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Ошибка при загрузке API ключа:', error);
      }
    };
    
    loadApiKey();
  }, []);

  // Обработчик сохранения API ключа
  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.length < 20) {
      toast.error("Пожалуйста, введите действительный API ключ (минимум 20 символов)");
      return;
    }

    try {
      await setApiKey(apiKey);
      setStoredApiKey(apiKey);
      setIsSaved(true);
      setApiKeyState(""); // Очищаем поле ввода после сохранения
      
      // Очищаем кеш после смены API ключа
      clearApiCache();
      
      toast.success("API ключ успешно сохранен и кеш очищен");
    } catch (error) {
      console.error('Ошибка при сохранении API ключа:', error);
      toast.error("Не удалось сохранить API ключ");
    }
  };

  // Обработчик копирования ключа в буфер обмена
  const handleCopy = () => {
    if (storedApiKey) {
      navigator.clipboard.writeText(storedApiKey);
      setHasCopied(true);
      toast.success("API ключ скопирован в буфер обмена");
      
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  };
  
  // Проверка API ключа - используем BASE_URL из config
  const checkApiKey = async () => {
    setIsCheckingApiKey(true);
    try {
      // Проверяем API ключ в localStorage
      const savedKey = await getApiKey();
      
      if (!savedKey) {
        toast.error("API ключ не найден");
        setIsCheckingApiKey(false);
        return;
      }
      
      // Используем BASE_URL из config и добавляем параметры запроса
      const testUrl = `${BASE_URL}?query=test&limit=1`;
      
      // Показываем уведомление о начале проверки
      toast.loading("Проверка API ключа...", { id: "api-check", duration: 5000 });
      
      // Очищаем кеш перед проверкой
      clearApiCache();
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Закрываем уведомление о проверке
        toast.dismiss("api-check");
        
        if (response.ok) {
          toast.success("API ключ действителен и работает корректно");
        } else {
          const errorText = await response.text();
          console.error('Ошибка при проверке API ключа:', response.status, errorText);
          toast.error(`Ошибка проверки API ключа: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        toast.dismiss("api-check");
        console.error('Ошибка сети при проверке API ключа:', error);
        toast.error(`Ошибка сети при проверке API ключа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при проверке API ключа:', error);
      toast.error("Не удалось проверить API ключ из-за внутренней ошибки");
    } finally {
      setIsCheckingApiKey(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="h-5 w-5 text-blue-600" />
        <Label htmlFor={`api-key-${keyType}`} className="text-lg font-medium">API ключ {keyType === "zylalabs" ? "Zylalabs" : keyType}</Label>
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
        <p>Для получения API ключа перейдите на сайт <a href="https://zylalabs.com/api/2033/real-time+product+search+api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zylalabs Real Time Product Search API</a></p>
      </div>
    </div>
  );
};
