
import React, { useEffect } from "react";
import { BrandSuggestionList } from "./BrandSuggestionList";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiKey } from "@/services/api/openai/config";
import { useAiBrandAssistant } from "@/hooks/useAiBrandAssistant";
import { ProductDescriptionForm } from "./ProductDescriptionForm";
import { BrandAssistantError } from "./BrandAssistantError";
import { SupabaseStatusMessage } from "./SupabaseStatusMessage";
import { Bot } from "lucide-react";

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  // Также проверяем атрибут data-path в body для более надежного определения
  const dataPath = document.body.getAttribute('data-path');
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings") ||
         dataPath === '/settings';
};

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

  // Обработчик выбора предложения бренда
  const handleSuggestionSelect = (searchQuery: string, immediate: boolean) => {
    // Явно передаем оба параметра в родительский компонент
    onSelectProduct(searchQuery, immediate);
  };

  // Проверяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();

  // Если мы на странице настроек, не отображаем компонент вообще
  if (inSettingsPage) {
    return null;
  }

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
