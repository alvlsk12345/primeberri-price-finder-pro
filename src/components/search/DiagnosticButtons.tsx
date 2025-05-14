
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Bot, Search } from 'lucide-react';
import { toast } from "sonner";
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';
import { callOpenAI } from '@/services/api/openai/apiClient';
import { hasValidApiKey as hasValidOpenAIApiKey } from '@/services/api/openai';
import { getSelectedAIProvider, getProviderDisplayName, getProviderModelName } from '@/services/api/aiProviderService';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';

export const DiagnosticButtons: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [openAiStatus, setOpenAiStatus] = useState<'неизвестно' | 'работает' | 'ошибка'>('неизвестно');
  const [googleApiStatus, setGoogleApiStatus] = useState<'неизвестно' | 'работает' | 'ошибка'>('неизвестно');
  const selectedProvider = getSelectedAIProvider();
  const providerDisplayName = getProviderDisplayName(selectedProvider);
  const modelName = getProviderModelName(selectedProvider);
  const [supabaseMode, setSupabaseMode] = useState<boolean | null>(null);

  // Проверяем использование Supabase
  React.useEffect(() => {
    const checkSupabaseMode = async () => {
      const isConnected = await isSupabaseConnected();
      const isUsingBackend = await isUsingSupabaseBackend();
      setSupabaseMode(isConnected && isUsingBackend);
    };
    
    checkSupabaseMode();
  }, []);

  // Тест Google API
  const testGoogleApi = async () => {
    try {
      setIsTestingGoogle(true);
      toast.loading("Тестирование Google API...");
      const result = await testMinimalGoogleApiRequest();
      
      if (result.includes('успешен')) {
        setGoogleApiStatus('работает');
        toast.success(`Тест Google API: ${result}`, { duration: 7000 });
      } else {
        setGoogleApiStatus('ошибка');
        toast.error(`Ошибка Google API: ${result}`, { duration: 7000 });
      }
    } catch (error) {
      console.error("Ошибка при тестировании Google API:", error);
      setGoogleApiStatus('ошибка');
      toast.error(`Ошибка Google API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsTestingGoogle(false);
    }
  };

  // Тест OpenAI API
  const testOpenAiApi = async () => {
    try {
      setIsTesting(true);
      
      if (!hasValidOpenAIApiKey()) {
        toast.error("API ключ OpenAI не установлен или имеет неверный формат", {
          duration: 5000,
          description: "Добавьте ключ в настройках приложения"
        });
        setOpenAiStatus('ошибка');
        return;
      }
      
      toast.loading("Тестирование OpenAI API...");

      // Добавляем информацию о режиме соединения
      const connectionMode = supabaseMode 
        ? "через Supabase Edge Function" 
        : "через прямое соединение";
      
      console.log(`Тестирование OpenAI API ${connectionMode}...`);
      
      const response = await callOpenAI("Ответь одним словом: Работает?", {
        temperature: 0.1,
        max_tokens: 50,
        model: "gpt-4o"
      });
      
      if (response && typeof response === 'string') {
        console.log("Ответ от OpenAI API:", response);
        toast.success(`Тест OpenAI API успешен! Ответ: ${response}`, {
          duration: 5000,
          description: `Используется модель: gpt-4o ${connectionMode}`
        });
        setOpenAiStatus('работает');
      } else {
        throw new Error("Некорректный ответ от API");
      }
    } catch (error) {
      console.error("Ошибка при тестировании OpenAI API:", error);
      
      let errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      // Улучшаем сообщения об ошибках для удобства пользователя
      if (supabaseMode && errorMessage.includes('Supabase')) {
        errorMessage = "Ошибка при вызове Edge Function. Проверьте настройки Supabase и API ключи в секретах.";
      } else if (errorMessage.includes('CORS')) {
        errorMessage = "Ошибка CORS. Для прямых вызовов OpenAI рекомендуется использовать Supabase Edge Functions.";
      }
      
      toast.error(`Ошибка OpenAI API: ${errorMessage}`, {
        duration: 5000
      });
      setOpenAiStatus('ошибка');
    } finally {
      setIsTesting(false);
    }
  };

  // Отображение информации о провайдере AI
  const showProviderInfo = () => {
    const connectionInfo = supabaseMode !== null 
      ? (supabaseMode ? "через Supabase Edge Function" : "прямое соединение")
      : "проверка соединения...";
      
    toast.info(`Активный AI провайдер: ${providerDisplayName}`, { 
      description: `Используется модель: ${modelName} (${connectionInfo})` 
    });
  };

  return (
    <div className="pt-3 flex flex-wrap gap-2">
      <Button
        onClick={testGoogleApi}
        size="sm"
        variant={googleApiStatus === 'работает' ? "outline" : "secondary"}
        className={`text-xs flex items-center gap-1 ${
          googleApiStatus === 'работает' ? 'border-green-500 text-green-700' : 
          googleApiStatus === 'ошибка' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
        }`}
        disabled={isTestingGoogle}
        type="button"
      >
        {isTestingGoogle ? (
          <>
            <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
            Тестирование...
          </>
        ) : (
          <>
            <Search size={14} />
            Тест Google API {googleApiStatus !== 'неизвестно' ? 
              `(${googleApiStatus === 'работает' ? '✓' : '✗'})` : ''}
          </>
        )}
      </Button>
      
      <Button
        onClick={testOpenAiApi}
        size="sm"
        variant={openAiStatus === 'работает' ? "outline" : "secondary"}
        className={`text-xs flex items-center gap-1 ${
          openAiStatus === 'работает' ? 'border-green-500 text-green-700' : 
          openAiStatus === 'ошибка' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
        }`}
        disabled={isTesting}
        type="button"
      >
        {isTesting ? (
          <>
            <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1" />
            Тестирование...
          </>
        ) : (
          <>
            <RefreshCw size={14} />
            Тест OpenAI API {openAiStatus !== 'неизвестно' ? 
              `(${openAiStatus === 'работает' ? '✓' : '✗'})` : ''}
          </>
        )}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        className="text-xs flex items-center gap-1 text-muted-foreground"
        onClick={showProviderInfo}
      >
        <Bot size={14} />
        AI: {providerDisplayName}
      </Button>
    </div>
  );
};
