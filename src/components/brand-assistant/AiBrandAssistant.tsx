
import React, { useState, useEffect } from "react";
import { BrandSuggestionList } from "./BrandSuggestionList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { fetchBrandSuggestions, getApiKey } from "@/services/api/openai";
import { BrandSuggestion } from "@/services/types";

interface AiBrandAssistantProps {
  onSelectProduct: (product: string, performSearch: boolean) => void;
}

export const AiBrandAssistant: React.FC<AiBrandAssistantProps> = ({ onSelectProduct }) => {
  const [isAssistantEnabled, setIsAssistantEnabled] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

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
      }
    } catch (error: any) {
      console.error('Ошибка при запросе к OpenAI для получения товаров:', error);
      if (error.message?.includes("quota")) {
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
      } else if (error.message?.includes("invalid")) {
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
      } else {
        toast.error("Не удалось получить предложения товаров. Попробуйте позже.");
      }
    } finally {
      setIsAssistantLoading(false);
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
                  <div className="animate-spin w-4 h-4 border-2 border-brand-foreground border-t-transparent rounded-full" />
                  <span>Поиск товаров...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Найти подходящие товары</span>
                </>
              )}
            </Button>
          </div>
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
