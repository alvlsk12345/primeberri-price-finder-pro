
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bot } from 'lucide-react';
import { toast } from "sonner";
import { getSelectedAIProvider, getProviderDisplayName, getProviderModelName } from '@/services/api/aiProviderService';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';

export const AiProviderInfo: React.FC = () => {
  const selectedProvider = getSelectedAIProvider();
  const providerDisplayName = getProviderDisplayName(selectedProvider);
  const modelName = getProviderModelName(selectedProvider);
  
  // Отображение информации о провайдере AI
  const showProviderInfo = async () => {
    // Проверяем соединение только когда это необходимо
    const isConnected = await isSupabaseConnected(false); // без логов
    const isUsingBackend = await isUsingSupabaseBackend();
    
    const connectionInfo = (isConnected && isUsingBackend) 
      ? "через Supabase Edge Function" 
      : "прямое соединение";
      
    toast.info(`Активный AI провайдер: ${providerDisplayName}`, { 
      description: `Используется модель: ${modelName} (${connectionInfo})` 
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs flex items-center gap-1 text-muted-foreground"
      onClick={showProviderInfo}
    >
      <Bot size={14} />
      AI: {providerDisplayName}
    </Button>
  );
};
