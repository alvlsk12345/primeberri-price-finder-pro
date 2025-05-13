
import React, { useEffect } from "react";
import { BrandSuggestionList } from "./BrandSuggestionList";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiKey } from "@/services/api/openai/config";
import { useAiBrandAssistant } from "@/hooks/useAiBrandAssistant";
import { ProductDescriptionForm } from "./ProductDescriptionForm";
import { BrandAssistantError } from "./BrandAssistantError";
import { SupabaseStatusMessage } from "./SupabaseStatusMessage";
import { Bot } from "lucide-react";

interface AiBrandAssistantProps {
  onSelectProduct: (product: string, performSearch: boolean) => void;
}

export const AiBrandAssistant: React.FC<AiBrandAssistantProps> = ({ onSelectProduct }) => {
  const {
    productDescription,
    setProductDescription,
    brandSuggestions,
    isAssistantLoading,
    errorMessage,
    hasError,
    supabaseStatus,
    checkSupabaseStatus,
    isAssistantEnabled,
    setIsAssistantEnabled,
    handleGetBrandSuggestions
  } = useAiBrandAssistant();

  // При необходимости проверяем статус Supabase только при включении помощника
  useEffect(() => {
    if (isAssistantEnabled && (!getApiKey() || !supabaseStatus.connected)) {
      checkSupabaseStatus();
    }
  }, [isAssistantEnabled]);

  // Обработчик выбора предложения бренда
  const handleSuggestionSelect = (searchQuery: string, immediate: boolean) => {
    console.log(`Выбран запрос: ${searchQuery}, немедленный поиск: ${immediate}`);
    // Явно передаем оба параметра в родительский компонент
    onSelectProduct(searchQuery, immediate);
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
              // Сбрасываем состояние при отключении помощника
              setProductDescription("");
            }
          }}
        />
        <label htmlFor="enableAssistant" className="text-sm cursor-pointer flex items-center gap-1">
          <Bot size={18} className="text-primary" />
          Использовать AI-помощник для поиска товаров
        </label>
      </div>

      {isAssistantEnabled && (
        <div className="mt-3 space-y-2">
          {/* Форма описания товара */}
          <ProductDescriptionForm 
            productDescription={productDescription}
            setProductDescription={setProductDescription}
            isAssistantLoading={isAssistantLoading} 
            handleGetBrandSuggestions={handleGetBrandSuggestions} 
          />
          
          {/* Сообщение об ошибке */}
          {hasError && errorMessage && (
            <BrandAssistantError errorMessage={errorMessage} />
          )}
          
          {/* Сообщение о пустых результатах */}
          {brandSuggestions.length === 0 && !isAssistantLoading && !hasError && (getApiKey() || supabaseStatus.connected) && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              <p>Введите описание товара и нажмите "Найти подходящие товары"</p>
            </div>
          )}
          
          {/* Сообщения о статусе Supabase */}
          {(!getApiKey() && !supabaseStatus.connected && isAssistantEnabled) ? (
            <SupabaseStatusMessage 
              connected={false} 
              enabled={false} 
              onRequestCheck={checkSupabaseStatus}
            />
          ) : (!supabaseStatus.enabled && supabaseStatus.connected) && (
            <SupabaseStatusMessage 
              connected={true} 
              enabled={false}
            />
          )}
        </div>
      )}

      {/* Список предложений брендов */}
      {isAssistantEnabled && brandSuggestions && brandSuggestions.length > 0 && (
        <BrandSuggestionList 
          suggestions={brandSuggestions}
          onSelect={(searchQuery, immediate) => handleSuggestionSelect(searchQuery, !!immediate)}
        />
      )}
    </div>
  );
};
