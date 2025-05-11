
import React, { useState, useEffect } from "react";
import { BrandSuggestionList } from "./BrandSuggestionList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { fetchBrandSuggestions } from "@/services/api/brandSuggestionService";
import { getApiKey } from "@/services/api/openai/config";
import { BrandSuggestion } from "@/services/types";

interface AiBrandAssistantProps {
  onSelectProduct: (product: string, performSearch: boolean) => void;
}

export const AiBrandAssistant: React.FC<AiBrandAssistantProps> = ({ onSelectProduct }) => {
  const [isAssistantEnabled, setIsAssistantEnabled] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 2;

  useEffect(() => {
    if (isAssistantEnabled) {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.error("Для использования AI-помощника необходимо указать ключ OpenAI API в настройках");
        setIsAssistantEnabled(false);
      }
    }
  }, [isAssistantEnabled]);

  const handleGetBrandSuggestions = async () => {
    if (!productDescription.trim()) {
      toast.error("Пожалуйста, введите описание товара");
      return;
    }

    setIsAssistantLoading(true);
    try {
      const suggestions = await fetchBrandSuggestions(productDescription);
      setBrandSuggestions(suggestions);
      
      if (suggestions.length === 0) {
        toast.warning("Не удалось найти подходящие товары для вашего запроса");
      } else {
        // Сбрасываем счетчик повторов при успешном запросе
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('Ошибка при запросе к OpenAI для получения товаров:', error);
      
      // Проверяем, можно ли повторить запрос
      if (retryCount < MAX_RETRIES && error.message?.includes("Failed to fetch")) {
        // Увеличиваем счетчик попыток
        setRetryCount(prevCount => prevCount + 1);
        
        // Показываем уведомление о повторной попытке
        toast.info(`Проблема соединения. Пробуем еще раз (попытка ${retryCount + 1}/${MAX_RETRIES})...`, {
          duration: 2000
        });
        
        // Небольшая задержка перед повторным запросом
        setTimeout(() => {
          handleGetBrandSuggestions();
        }, 1500);
        
        return;
      }
      
      // Обработка других типов ошибок
      if (error.message?.includes("quota")) {
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
      } else if (error.message?.includes("invalid")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
      } else if (error.message?.includes("API ключ не установлен")) {
        toast.error("Необходимо указать API ключ OpenAI в настройках.");
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("Исчерпаны все попытки")) {
        toast.error("Не удалось подключиться к API. Проверьте подключение к интернету или перейдите в настройки для проверки API.");
      } else {
        toast.error("Не удалось получить предложения товаров. Попробуйте позже или проверьте настройки API.");
      }
    } finally {
      setIsAssistantLoading(false);
      // Сбрасываем счетчик повторов при любом финальном результате
      setRetryCount(0);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <Checkbox 
          id="enableAssistant" 
          checked={isAssistantEnabled} 
          onCheckedChange={(checked) => {
            setIsAssistantEnabled(!!checked);
            if (!checked) {
              setBrandSuggestions([]);
            }
          }}
        />
        <label htmlFor="enableAssistant" className="text-sm cursor-pointer">
          Использовать AI-помощник для поиска товаров
        </label>
      </div>

      {isAssistantEnabled && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Опишите, что вы хотите найти, например: удобные кроссовки для бега по пересеченной местности"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              variant="brand"
              size="sm"
              onClick={handleGetBrandSuggestions}
              disabled={!productDescription.trim() || isAssistantLoading}
            >
              {isAssistantLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-brand-foreground border-t-transparent rounded-full mr-2" />
                  <span>Поиск товаров...</span>
                </>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  <span>Найти подходящие товары</span>
                </>
              )}
            </Button>
          </div>
          
          {brandSuggestions.length === 0 && !isAssistantLoading && getApiKey() && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              <p>Введите описание товара и нажмите "Найти подходящие товары"</p>
            </div>
          )}
          
          {!getApiKey() && isAssistantEnabled && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-3">
              <p className="text-sm text-amber-700">
                Для работы AI-помощника необходимо указать API ключ OpenAI в настройках приложения.
                <a href="/settings" className="ml-1 underline font-medium">Перейти к настройкам</a>
              </p>
            </div>
          )}
        </div>
      )}

      {isAssistantEnabled && brandSuggestions.length > 0 && (
        <BrandSuggestionList 
          suggestions={brandSuggestions} 
          onSelect={(product) => onSelectProduct(product, true)} 
        />
      )}
    </div>
  );
};
