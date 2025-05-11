
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
import { isSupabaseConnected } from "@/services/api/supabase/client";
import { isUsingSupabaseBackend } from "@/services/api/supabase/config";

interface AiBrandAssistantProps {
  onSelectProduct: (product: string, performSearch: boolean) => void;
}

export const AiBrandAssistant: React.FC<AiBrandAssistantProps> = ({ onSelectProduct }) => {
  const [isAssistantEnabled, setIsAssistantEnabled] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState<{connected: boolean; enabled: boolean}>({
    connected: false,
    enabled: false
  });

  const MAX_RETRIES = 2;

  // Проверяем статус Supabase при загрузке компонента
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const connected = await isSupabaseConnected();
        const enabled = await isUsingSupabaseBackend();
        console.log('Статус Supabase в AiBrandAssistant:', { connected, enabled });
        setSupabaseStatus({ connected, enabled });
      } catch (error) {
        console.error('Ошибка при проверке статуса Supabase:', error);
      }
    };
    
    checkSupabaseStatus();
  }, []);

  useEffect(() => {
    if (isAssistantEnabled) {
      const apiKey = getApiKey();
      if (!apiKey && !supabaseStatus.connected) {
        toast.error("Для использования AI-помощника необходим ключ API или подключение к Supabase");
        setIsAssistantEnabled(false);
      }
    }
  }, [isAssistantEnabled, supabaseStatus]);

  const handleGetBrandSuggestions = async () => {
    if (!productDescription.trim()) {
      toast.error("Пожалуйста, введите описание товара");
      return;
    }

    console.log("Запрос поиска товаров с текстом:", productDescription);
    setIsAssistantLoading(true);
    
    try {
      // Добавляем запрос на получение 5 результатов в описание
      const enhancedDescription = productDescription + 
        ". Пожалуйста, предложите 5 конкретных товаров с указанием бренда и модели.";
      
      console.log(`Отправляем запрос на поиск брендов: "${enhancedDescription}"`);
      
      let suggestions = await fetchBrandSuggestions(enhancedDescription);
      console.log("Получены предложения брендов:", suggestions);
      
      // Проверка на валидность полученных данных
      if (!suggestions) {
        console.warn("Получен пустой ответ от fetchBrandSuggestions");
        suggestions = [];
      }
      
      // Нормализация результатов: если получен один объект вместо массива
      if (suggestions && !Array.isArray(suggestions)) {
        console.log("Получен один объект вместо массива, преобразуем его");
        suggestions = [suggestions];
      }
      
      // Явно устанавливаем состояние на основе полученных данных
      console.log("Устанавливаем состояние brandSuggestions:", suggestions);
      setBrandSuggestions(Array.isArray(suggestions) ? suggestions : []);
      
      if (!suggestions || suggestions.length === 0) {
        toast.warning("Не удалось найти подходящие товары для вашего запроса");
      } else {
        // Сбрасываем счетчик повторов при успешном запросе
        setRetryCount(0);
        toast.success(`Найдено ${suggestions.length} предложений товаров`);
      }
    } catch (error: any) {
      console.error('Ошибка при запросе к AI для получения товаров:', error);
      
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
      
      // При ошибке устанавливаем пустой массив предложений
      setBrandSuggestions([]);
    } finally {
      setIsAssistantLoading(false);
      // Сбрасываем счетчик повторов при любом финальном результате
      setRetryCount(0);
    }
  };

  // Явная проверка состояния brandSuggestions для отладки
  useEffect(() => {
    console.log('Состояние brandSuggestions обновлено:', brandSuggestions);
  }, [brandSuggestions]);

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
            onChange={(e) => {
              console.log("Текст в Textarea изменен:", e.target.value);
              setProductDescription(e.target.value);
            }}
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
          
          {brandSuggestions.length === 0 && !isAssistantLoading && (getApiKey() || supabaseStatus.connected) && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              <p>Введите описание товара и нажмите "Найти подходящие товары"</p>
            </div>
          )}
          
          {(!getApiKey() && !supabaseStatus.connected) && isAssistantEnabled && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-3">
              <p className="text-sm text-amber-700">
                Для работы AI-помощника необходимо настроить подключение к Supabase или указать API ключ OpenAI в настройках.
                <a href="/settings" className="ml-1 underline font-medium">Перейти к настройкам</a>
              </p>
            </div>
          )}
          
          {!supabaseStatus.enabled && supabaseStatus.connected && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-3">
              <p className="text-sm text-blue-700">
                Рекомендуется включить опцию "Использовать Supabase Backend" в настройках для обхода ограничений CORS.
                <a href="/settings" className="ml-1 underline font-medium">Перейти к настройкам</a>
              </p>
            </div>
          )}
        </div>
      )}

      {isAssistantEnabled && brandSuggestions && brandSuggestions.length > 0 && (
        <>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Данные для отладки: получено {brandSuggestions.length} предложений</p>
          </div>
          <BrandSuggestionList 
            suggestions={brandSuggestions} 
            onSelect={onSelectProduct} 
          />
        </>
      )}
    </div>
  );
};
