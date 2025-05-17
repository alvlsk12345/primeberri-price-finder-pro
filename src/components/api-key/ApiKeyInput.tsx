
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onSave: () => void;
  keyType: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  onApiKeyChange,
  onSave,
  keyType
}) => {
  // Функция для проверки валидности API ключа
  const isValidApiKey = (key: string) => {
    return key && key.length > 20;
  };

  return (
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
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onSave} disabled={!apiKey || apiKey.length < 10}>
          Сохранить
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        API ключ хранится локально в вашем браузере и используется только для запросов к API.
      </p>
    </div>
  );
};
