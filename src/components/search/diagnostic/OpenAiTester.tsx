
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { callOpenAI } from '@/services/api/openai';
import { hasValidApiKey as hasValidOpenAIApiKey } from '@/services/api/openai';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';

export type OpenAiStatus = 'неизвестно' | 'работает' | 'ошибка';

interface OpenAiTesterProps {
  openAiStatus: OpenAiStatus;
  setOpenAiStatus: (status: OpenAiStatus) => void;
}

export const OpenAiTester: React.FC<OpenAiTesterProps> = ({ 
  openAiStatus, 
  setOpenAiStatus 
}) => {
  const [isTesting, setIsTesting] = useState(false);

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

      // Для теста OpenAI проверяем текущий режим соединения
      const isConnected = await isSupabaseConnected(true);
      const isUsingBackend = await isUsingSupabaseBackend();

      // Определяем режим соединения на основании проверки
      const connectionMode = (isConnected && isUsingBackend) 
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
      if (errorMessage.includes('Supabase')) {
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

  return (
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
  );
};
