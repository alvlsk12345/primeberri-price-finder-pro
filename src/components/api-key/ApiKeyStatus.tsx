
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { clearApiCache } from "@/services/api/zylalabs/cacheService";

interface ApiKeyStatusProps {
  storedApiKey: string;
  isCheckingApiKey: boolean;
  onCopy: () => void;
  checkApiKey: () => Promise<void>;
  hasCopied: boolean;
}

export const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ 
  storedApiKey, 
  isCheckingApiKey, 
  onCopy, 
  checkApiKey,
  hasCopied 
}) => {
  // Получаем замаскированную версию ключа для отображения
  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 10) return "********";
    return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
  };

  return (
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
        onClick={onCopy}
        className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
      >
        {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
