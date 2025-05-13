
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Bot } from "lucide-react";
import { AIProvider } from "@/services/api/aiProviderService";

type AiProviderSettingsProps = {
  selectedProvider: AIProvider;
  handleProviderChange: (value: AIProvider) => void;
};

export const AiProviderSettings: React.FC<AiProviderSettingsProps> = ({
  selectedProvider,
  handleProviderChange
}) => {
  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Выбор AI провайдера</CardTitle>
        <CardDescription>
          Выберите предпочитаемый AI провайдер для поиска брендов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertCircle size={18} />
            <span className="font-medium">Важная информация</span>
          </div>
          <p className="text-sm text-amber-700">
            Выбранный AI провайдер будет использоваться для поиска брендов и товаров.
            Для каждого провайдера требуется свой API ключ, который вы можете настроить ниже.
          </p>
        </div>
        <RadioGroup 
          value={selectedProvider} 
          onValueChange={(value) => handleProviderChange(value as AIProvider)}
          className="space-y-4 mb-6"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="flex items-center gap-2 cursor-pointer">
              <Bot size={18} className="text-green-600" />
              <span>OpenAI (GPT-4o)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="abacus" id="abacus" />
            <Label htmlFor="abacus" className="flex items-center gap-2 cursor-pointer">
              <Bot size={18} className="text-blue-600" />
              <span>Abacus.ai</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="perplexity" id="perplexity" />
            <Label htmlFor="perplexity" className="flex items-center gap-2 cursor-pointer">
              <Bot size={18} className="text-purple-600" />
              <span>Perplexity AI (Llama 3.1)</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
