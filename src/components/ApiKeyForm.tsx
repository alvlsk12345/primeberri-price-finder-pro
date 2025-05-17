
import React, { useState, useEffect } from 'react';
import { setApiKey, getApiKey, ZYLALABS_API_KEY } from "@/services/api/zylalabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { useDemoModeForced } from "@/services/api/mock/mockServiceConfig";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";

// Интерфейс для пропсов ApiKeyForm
interface ApiKeyFormProps {
  keyType?: string;
}

// Функция для проверки валидности API ключа
const isValidApiKey = (key: string) => {
  return key && key.length > 20;
};

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
    if (!isValidApiKey(apiKey)) {
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

  // Получаем замаскированную версию ключа для отображения
  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 10) return "********";
    return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
  };
  
  // Проверка API ключа
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
      
      // Простая проверка - строим тестовый URL и делаем запрос
      const testUrl = `https://api.zylalabs.com/api/2033/real+time+product+search+api/1809/search+products?query=test&limit=1`;
      
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
      
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-800">
          <p className="font-medium">Демо-режим активирован</p>
          <p className="mt-1">В демо-режиме некоторые результаты могут быть заменены тестовыми данными.</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`api-key-${keyType}`} className="text-sm text-gray-600">
          Введите ваш API ключ от {keyType === "zylalabs" ? "Zylalabs" : keyType} для доступа к поиску товаров
        </Label>
        <div className="flex gap-2">
          <Input
            id={`api-key-${keyType}`}
            type="password"
            placeholder="Введите API ключ..."
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveApiKey} disabled={!apiKey || apiKey.length < 10}>
            Сохранить
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          API ключ хранится локально в вашем браузере и используется только для запросов к API.
        </p>
      </div>
      
      {isSaved && storedApiKey && (
        <div className="flex items-center gap-2 text-sm mt-2 bg-green-50 border border-green-200 rounded-md p-2">
          <p>Текущий ключ: <span className="font-mono">{getMaskedKey(storedApiKey)}</span></p>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkApiKey}
            disabled={isCheckingApiKey}
            className="ml-auto h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            <RefreshCw className={`h-4 w-4 ${isCheckingApiKey ? 'animate-spin' : ''}`} />
            <span className="ml-1">Проверить</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Для получения API ключа перейдите на сайт <a href="https://zylalabs.com/api/2033/real+time+product+search+api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zylalabs Real Time Product Search API</a></p>
      </div>
    </div>
  );
};
