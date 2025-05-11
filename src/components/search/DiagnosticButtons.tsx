
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Bot } from 'lucide-react';
import { toast } from "sonner";
import { testMinimalGoogleApiRequest } from '@/services/api/googleSearchService';
import { callOpenAI } from '@/services/api/openai';
import { hasValidApiKey as hasValidOpenAIApiKey } from '@/services/api/openai';
import { getSelectedAIProvider, getProviderDisplayName, getProviderModelName } from '@/services/api/aiProviderService';

export const DiagnosticButtons: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [openAiStatus, setOpenAiStatus] = useState<'неизвестно' | 'работает' | 'ошибка'>('неизвестно');
  const selectedProvider = getSelectedAIProvider();
  const providerDisplayName = getProviderDisplayName(selectedProvider);
  const modelName = getProviderModelName(selectedProvider);

  // Тест Google API
  const testGoogleApi = async () => {
    const result = await testMinimalGoogleApiRequest();
    toast.info(`Тест Google API: ${result}`, { duration: 7000 });
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
      
      const response = await callOpenAI("Ответь одним словом: Работает?", {
        temperature: 0.1,
        max_tokens: 50,
        model: "gpt-4o"
      });
      
      if (response && typeof response === 'string') {
        console.log("Ответ от OpenAI API:", response);
        toast.success(`Тест OpenAI API успешен! Ответ: ${response}`, {
          duration: 5000,
          description: `Используется модель: gpt-4o`
        });
        setOpenAiStatus('работает');
      } else {
        throw new Error("Некорректный ответ от API");
      }
    } catch (error) {
      console.error("Ошибка при тестировании OpenAI API:", error);
      toast.error(`Ошибка OpenAI API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, {
        duration: 5000
      });
      setOpenAiStatus('ошибка');
    } finally {
      setIsTesting(false);
    }
  };

  // Отображение информации о провайдере AI
  const showProviderInfo = () => {
    toast.info(`Активный AI провайдер: ${providerDisplayName}`, { 
      description: `Используется модель: ${modelName}` 
    });
  };

  return (
    <div className="pt-3 flex flex-wrap gap-2">
      <Button
        onClick={testGoogleApi}
        size="sm"
        variant="outline"
        className="text-xs"
        type="button"
      >
        Тест Google API
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
