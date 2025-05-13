
import { useState } from 'react';
import { callOpenAI } from "@/services/api/openai/apiClient";
import { getApiKey as getOpenAIApiKey } from "@/services/api/openai/config";
import { callAbacusAI } from "@/services/api/abacus/apiClient";
import { getApiKey as getAbacusApiKey } from "@/services/api/abacus/config";
import { callPerplexityAI } from "@/services/api/perplexity/apiClient";
import { getApiKey as getPerplexityApiKey } from "@/services/api/perplexity/config";
import { callAIViaSupabase } from "@/services/api/supabase/aiService";
import { toast } from "sonner";
import { AIProvider } from "@/services/api/aiProviderService";

export function useApiConnection() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [proxyInfo, setProxyInfo] = useState<string>("Прямое соединение (без прокси)");

  // Функция для тестирования подключения к API
  const testApiConnection = async (selectedProvider: AIProvider, useSupabaseBE: boolean, supabaseConnected: boolean) => {
    setApiStatus('testing');
    
    try {
      if (useSupabaseBE && supabaseConnected) {
        // Проверяем работу через Supabase
        await callAIViaSupabase({
          provider: selectedProvider,
          prompt: selectedProvider === 'openai' ? "Скажи 'привет'" : undefined,
          endpoint: selectedProvider === 'abacus' ? 'testConnection' : undefined,
          method: 'GET'
        });
        
        setApiStatus('success');
        toast.success(`Проверка API ${selectedProvider.toUpperCase()} через Supabase успешна!`);
        return;
      }
      
      // Если Supabase не используется или недоступен, проверяем прямое соединение
      if (selectedProvider === 'openai') {
        // Проверяем наличие API ключа OpenAI
        const apiKey = getOpenAIApiKey();
        if (!apiKey) {
          toast.error("API ключ OpenAI не установлен. Пожалуйста, добавьте свой ключ сначала.");
          setApiStatus('error');
          return;
        }
        
        // Выполняем простой запрос к API OpenAI
        await callOpenAI("Скажи 'привет'", {
          max_tokens: 10,
          temperature: 0
        });
      } else if (selectedProvider === 'abacus') {
        // Проверяем наличие API ключа Abacus
        const apiKey = getAbacusApiKey();
        if (!apiKey) {
          toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ сначала.");
          setApiStatus('error');
          return;
        }
        
        // Выполняем простой запрос к API Abacus (для теста)
        await callAbacusAI('testConnection', 'GET');
      } else if (selectedProvider === 'perplexity') {
        // Проверяем наличие API ключа Perplexity
        const apiKey = getPerplexityApiKey();
        if (!apiKey) {
          toast.error("API ключ Perplexity не установлен. Пожалуйста, добавьте свой ключ сначала.");
          setApiStatus('error');
          return;
        }
        
        // Выполняем простой запрос к API Perplexity
        await callPerplexityAI("Скажи 'привет'", {
          max_tokens: 10,
          temperature: 0
        });
      }
      
      // Если запрос успешен, обновляем статус
      setApiStatus('success');
      setProxyInfo('Прямое соединение');
      toast.success(`Проверка API ${selectedProvider.toUpperCase()} успешна! Режим соединения: прямой`);
    } catch (error: any) {
      console.error(`Ошибка при тестировании API ${selectedProvider}:`, error);
      setApiStatus('error');
      
      if (error.message.includes("API ключ не установлен")) {
        toast.error(`API ключ ${selectedProvider} не указан. Пожалуйста, добавьте ключ в форме выше.`);
      } else if (error.message.includes("Недействительный API ключ")) {
        toast.error(`Недействительный API ключ ${selectedProvider}. Пожалуйста, проверьте ключ.`);
      } else if (error.message.includes("Failed to fetch") || error.message.includes("Исчерпаны все попытки")) {
        toast.error("Не удалось подключиться к API. Возможные причины: проблемы с сетью или CORS ограничения.");
      } else {
        toast.error(`Ошибка при тестировании API: ${error.message}`);
      }
    }
  };

  return {
    apiStatus,
    proxyInfo,
    testApiConnection,
    setApiStatus
  };
}
